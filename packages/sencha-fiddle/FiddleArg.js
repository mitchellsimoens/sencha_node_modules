const dummyjson = require('dummy-json');

/** filter start */
const operatorFns    = {
    '!='      (value, filterValue) {
        return value != filterValue;
    },
    '!=='     (value, filterValue) {
        return value !== filterValue;
    },
    '<'       (value, filterValue) {
        return value < filterValue;
    },
    '<='      (value, filterValue) {
        return value <= filterValue;
    },
    '='       (value, filterValue) {
        return value == filterValue;
    },
    '==='     (value, filterValue) {
        return value === filterValue;
    },
    '>'       (value, filterValue) {
        return value > filterValue;
    },
    '>='      (value, filterValue) {
        return value >= filterValue;
    },
    'in'      (value, filterValue) {
        if (Array.isArray(filterValue)) {
            return filterValue.includes(value);
        }
    },
    'like'    (value, filterValue) {
        const regex = new RegExp(filterValue, 'i');

        return regex ? regex.test(value) : false;
    },
    'notin'   (value, filterValue) {
        if (Array.isArray(filterValue)) {
            return !filterValue.includes(value);
        }
    },
    'notlike' (value, filterValue) {
        const regex = new RegExp(filterValue, 'i');

        return regex ? !regex.test(value) : true;
    }
};

operatorFns[ '==' ] = operatorFns[ '=' ];
operatorFns[ '/=' ] = operatorFns.like;
operatorFns.gt    = operatorFns[ '>' ];
operatorFns.ge    = operatorFns[ '>=' ];
operatorFns.lt    = operatorFns[ '<' ];
operatorFns.le    = operatorFns[ '<=' ];
operatorFns.eq    = operatorFns[ '=' ];
operatorFns.ne    = operatorFns[ '!=' ];
const createFilterFn = (...args) => item => !args.some(filter => {
    const operator = filter.operator || '=';
    const fn       = operatorFns[ operator.toLowerCase() ];

    return fn(item[ filter.property ], filter.value, item, filter) === false;
});
/** filter end */

/** sort start */
const descRe        = /^desc$/i;
const defaultSortFn = (a, b) => {
    if (a === b) {
        return 0;
    }

    return a < b ? -1 : 1;
};
const getCmpFunc    = reverse => {
    if (reverse) {
        return (a, b) => -1 * defaultSortFn(a, b);
    }

    return defaultSortFn;
};
const createSortFn  = (...args) => {
    const fields = args.map(field => {
        if (typeof field === 'string') {
            return {
                fn       : defaultSortFn,
                property : field
            };
        } else {
            return {
                fn       : getCmpFunc(descRe.test(field.direction)),
                property : field.property
            };
        }
    });

    return (A, B) => {
        const { length } = fields;
        let i = 0,
            result;

        for (; i < length; i++) {
            const field        = fields[ i ];
            const { property } = field;

            result = field.fn(A[ property ], B[ property ]);

            if (result !== 0) {
                break;
            }
        }

        return result;
    };
};
/** sort end */

/** sort & filter shared start */
const data = (data, sortInfo, filterInfo) => {
    if (filterInfo) {
        if (typeof filterInfo === 'string') {
            filterInfo = JSON.parse(filterInfo);
        }

        if (!Array.isArray(filterInfo)) {
            filterInfo = [ filterInfo ];
        }

        data = data.filter(
            createFilterFn.apply(this, filterInfo)
        );
    }

    if (sortInfo) {
        if (typeof sortInfo === 'string') {
            sortInfo = JSON.parse(sortInfo);
        }

        if (!filterInfo) {
            // filter creates a new array, sort does not
            data = data.slice();
        }

        if (!Array.isArray(sortInfo)) {
            sortInfo = [ sortInfo ];
        }

        data.sort(
            createSortFn.apply(this, sortInfo)
        );
    }

    return data;
};
const sort   = (arr, sort, filter) => data(arr, sort, filter);
const filter = (arr, filter, sort) => data(arr, sort, filter);

/** template start */
const arrayExtractRe  = /^[^[]*(\[[\s\S]*\])[^\]]*$/m;
const objectExtractRe = /^[^{]*({[\s\S]*})[^}]*$/m;
const stripComments   = code => {
    const objPos = code.indexOf('{');
    const arrPos = code.indexOf('[');

    let re  = arrayExtractRe,
        re2 = objectExtractRe,
        data; // eslint-disable-line sort-vars

    if (objPos >= 0 && (arrPos < 0 || objPos < arrPos)) {
        // found-object && (no-array or object-before-array)
        re  = objectExtractRe;
        re2 = arrayExtractRe;
    }

    if (!(data = re.exec(code))) {
        data = re2.exec(code);
    }

    if (data) {
        code = JSON.parse(data[ 1 ]);
    }

    return code;
};
const defaultOptions = {
    stripComments : true
};
const template = (code, options) => {
    if (typeof code === 'string') {
        options = Object.assign({}, defaultOptions, options);

        const { params } = options;

        let temp = code;

        if (options.stripComments) {
            temp = stripComments(temp);
        }

        temp = dummyjson.parse(temp);

        if (temp && params) {
            const { filter, sort } = params;

            if (sort || filter) {
                if (typeof temp === 'string') {
                    temp = JSON.parse(temp);
                }

                if (Array.isArray(temp)) {
                    temp = data(temp, sort, filter);
                } else {
                    for (const key in temp) {
                        const value = temp[ key ];

                        if (Array.isArray(value)) {
                            temp[ key ] = data(value, sort, filter);
                        }
                    }
                }

                temp = JSON.stringify(temp);
            }
        }

        code = temp;
    }

    return code;
};
/** template end */

module.exports = {
    data,
    filter,
    sort,
    template
};
