const { Base } = require('@extjs/sencha-core');

class Console extends Base {
    static find (namespace, doCreate) {
        let { instances } = this,
            instance;

        if (instances) {
            instance = instances[ namespace ];
        } else {
            instances = {};

            this.instances = instances;
        }

        if (namespace && !instance && doCreate !== false) {
            instance = new this({
                namespace
            });

            instances[ namespace ] = instance;
        }

        return instance;
    }

    static _setEnabled (...args) {
        this.prototype._setEnabled(...args);
    }

    static enable (level) {
        this._setEnabled(level);
    }

    static disable (level) {
        this._setEnabled(level, false);
    }

    ctor () {
        const { namespace, constructor : { instances } } = this;

        if (instances) {
            instances[ namespace ] = this;
        } else {
            this.constructor.instances = {
                [ namespace ] : this
            };
        }
    }

    dtor () {
        this.logger = null;

        delete this.constructor.instances[ this.namespace ];
    }

    get logger () {
        return this._logger || console;
    }

    set logger (logger) {
        this._logger = logger;
    }

    get namespace () {
        return this._namespace;
    }

    set namespace (namespace) {
        this.namespaceArr = this._wrapColor(
            [ namespace ],
            this.randomColor
        );

        this._namespace = namespace;
    }

    get colorMap () {
        // colors: http://telepathy.freedesktop.org/doc/telepathy-glib/telepathy-glib-debug-ansi.html
        return {
            bg : {
                blue    : '\x1b[44m',
                cyan    : '\x1b[46m',
                green   : '\x1b[42m',
                magenta : '\x1b[45m',
                red     : '\x1b[41m',
                white   : '\x1b[47m',
                yellow  : '\x1b[43m'
            },
            fg : {
                black   : '\x1b[30m',
                blue    : '\x1b[34m',
                cyan    : '\x1b[36m',
                green   : '\x1b[32m',
                magenta : '\x1b[35m',
                red     : '\x1b[31m',
                white   : '\x1b[37m',
                yellow  : '\x1b[33m'
            }
        };
    }

    get colors () {
        const colors = [
            { bg : 'blue',    fg : 'black'   }, // eslint-disable-line object-property-newline
            { bg : 'black',   fg : 'blue'    }, // eslint-disable-line object-property-newline
            { bg : 'blue',    fg : 'white'   }, // eslint-disable-line object-property-newline
            { bg : 'white',   fg : 'blue'    }, // eslint-disable-line object-property-newline
            { bg : 'cyan',    fg : 'black'   }, // eslint-disable-line object-property-newline
            { bg : 'black',   fg : 'cyan'    }, // eslint-disable-line object-property-newline
            { bg : 'green',   fg : 'black'   }, // eslint-disable-line object-property-newline
            { bg : 'black',   fg : 'green'   }, // eslint-disable-line object-property-newline
            { bg : 'magenta', fg : 'black'   }, // eslint-disable-line object-property-newline
            { bg : 'black',   fg : 'magenta' }, // eslint-disable-line object-property-newline
            { bg : 'magenta', fg : 'white'   }, // eslint-disable-line object-property-newline
            { bg : 'white',   fg : 'magenta' }, // eslint-disable-line object-property-newline
            { bg : 'red',     fg : 'black'   }, // eslint-disable-line object-property-newline
            { bg : 'black',   fg : 'red'     }, // eslint-disable-line object-property-newline
            { bg : 'red',     fg : 'white'   }, // eslint-disable-line object-property-newline
            { bg : 'white',   fg : 'red'     }, // eslint-disable-line object-property-newline
            { bg : 'yellow',  fg : 'black'   }, // eslint-disable-line object-property-newline
            { bg : 'black',   fg : 'yellow'  } // eslint-disable-line object-property-newline
        ];

        colors.reset = '\x1b[0m';
        colors.error = {
            bg : 'red',
            fg : 'white'
        };
        colors.info = {
            bg : 'blue',
            fg : 'white'
        };

        return colors;
    }

    get randomColor () {
        const { colors } = this;

        return colors[ Math.floor(Math.random() * colors.length) ];
    }

    _setEnabled (level, value = true) {
        const me = this;

        if (level == null || typeof level === 'boolean') {
            if (level == null) {
                level = value;
            }

            me.errorEnabled = level;
            me.infoEnabled  = level;
            me.logEnabled   = level;
        } else if (Array.isArray(level)) {
            level.forEach(single => me._setEnabled(single, value));
        } else if (typeof level === 'object') {
            for (const key in level) {
                let val = level[ key ];

                if (val == null) {
                    val = value;
                }

                me._setEnabled(key, val);
            }
        } else {
            switch (level) {
                case 'error' :
                    me.errorEnabled = value;
                    break;
                case 'info' :
                    me.infoEnabled = value;
                    break;
                case 'log' :
                    me.logEnabled = value;
                    break;
            }
        }
    }

    enable (level) {
        this._setEnabled(level);
    }

    disable (level) {
        this._setEnabled(level, false);
    }

    error (...args) {
        if (this.errorEnabled) {
            args = this._addNamespace(args, 'error');

            this.logger.info(...args);
        }
    }

    info (...args) {
        if (this.infoEnabled) {
            args = this._addNamespace(args, 'info');

            this.logger.info(...args);
        }
    }

    log (...args) {
        if (this.logEnabled) {
            args = this._addNamespace(args, 'log');

            this.logger.log(...args);
        }
    }

    _lookupColor (color) {
        const { colorMap } = this;
        const isObject = typeof color === 'object';

        return {
            bg : colorMap.bg[ isObject ? color.bg : color ],
            fg : colorMap.fg[ isObject ? color.fg : color ]
        };
    }

    _wrapColor (arr, color) {
        const { reset } = this.colors;

        color = this._lookupColor(color);

        if (color.fg) {
            arr.unshift(color.fg);

            arr.push(reset);
        }

        if (color.bg) {
            arr.unshift(color.bg);

            if (!color.fg) {
                arr.push(reset);
            }
        }

        return arr;
    }

    _addNamespace (args, type) {
        let ret;

        if (type === 'error') {
            ret = this._wrapColor([ '**ERROR**' ], this.colors.error);
        } else if (type === 'info') {
            ret = this._wrapColor([ '**INFO**' ], this.colors.info);
        }

        if (Array.isArray(ret)) {
            ret = this.namespaceArr.concat(ret);
        } else {
            ret = this.namespaceArr;
        }

        return ret.concat(args);
    }
}

module.exports = Console;
