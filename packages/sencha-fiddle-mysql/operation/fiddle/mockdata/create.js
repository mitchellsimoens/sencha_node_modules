const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.MockData.create
 * @extends Sencha.core.Base
 *
 * A class to manage all CREATE operations for fiddle data assets.
 */
class MockData extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleMockDataCreator
                 */
                isFiddleMockDataCreator : true
            }
        };
    }

    create (data, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.data,
                data.type,
                data.url,
                data.statusCode || 200,
                data.delay,
                data.dynamic,
                !!data.formHandler,
                data.direct_args,
                data.direct_len
            ];
            const query   = new Query({
                inserts,
                sqls : `INSERT INTO fiddle_mockdata
(fiddleid, data, type, url, statusCode, delay, dynamic, formHandler, direct_args, direct_len)
SELECT @fiddleid, ?, ?, ?, ?, ?, ?, ?, ?, ? FROM (SELECT 1) temp WHERE @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = MockData;
