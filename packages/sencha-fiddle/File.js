const url    = require('url');
const { VM } = require('vm2');

const Base      = require('./Base');
const FiddleArg = require('./FiddleArg');
const Fiddle    = require('./Fiddle');
const Manager   = require('./Manager');

const types = {
    css        : 'text/css',
    javascript : 'application/javascript',
    js         : 'application/javascript',
    json       : 'application/javascript',
    plaintext  : 'text/html',
    xml        : 'application/xml'
};

const fileExt = [
    'css',
    'html',
    'js'
];


const numberRe = /^\d+$/;
const urlExtRe = /\.([a-z]+)$/;

/**
 * @class Sencha.fiddle.File
 * @extends Sencha.fiddle.Base
 *
 * A class that can load files for a fiddle or session.
 */
class File extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFile
                 */
                isFile : true,

                /**
                 * @cfg {Number} [scriptTimeout=500] The number of milliseconds
                 * to allow a dynamic file to execute. This can prevent the code
                 * from locking up a server.
                 */
                scriptTimeout : 500
            }
        };
    }

    /**
     * Method to parse if a file is a mock data or file asset.
     * @static
     * @method
     * @param {String} name The name of the file to check based on extension.
     */
    static isData (name) {
        // NEED TO FIGURE OUT A BETTER WAY MAYBE?
        const parsed  = url.parse(name);
        const matches = parsed.pathname.match(urlExtRe);

        return matches ? fileExt.indexOf(matches[ 1 ]) === -1 : true;
    }

    /**
     * @static
     * @method
     * @param {Object} info
     * @param {String} info.fiddleid Required. The fiddle id to load
     * a file for.
     * @param {String} info.name Required. The name (path) of the file
     * to load.
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    static loadForFiddle (info) {
        return new Promise((resolve, reject) => {
            if (info.name) {
                if (info.fiddleid) {
                    const { connection, fiddleid: id } = info;

                    Fiddle
                        .load({
                            connection,
                            id
                        })
                        .then((fiddle) => {
                            // could support glob formats here maybe for REST support?
                            let file = fiddle.data.assets.find(asset => asset.name === info.name || asset.url === info.name);

                            if (!file) {
                                file = fiddle.data.mockdata.find(asset => asset.name === info.name || asset.url === info.name);
                            }

                            if (info.name === 'app.js' && fiddle._hasReactor()) {
                                file.code = `Ext.onReady(function() {
    require('app.js');
});`;
                            }

                            return file;
                        })
                        .then(data => new this({
                            data,
                            params : info.params,
                            req    : info.req
                        }))
                        .then(file => file.maybeDelay())
                        .then(file => file.maybeWrap())
                        .then(file => file._handleDynamic())
                        .then(file => file.template())
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error('No fiddle id to load a file for.'));
                }
            } else {
                reject(new Error('No name to load a file.'));
            }
        });
    }

    /**
     * @static
     * @method
     * @param {Object} info
     * @param {String} info.sessionid Required. The session id to load
     * a file from.
     * @param {String} info.name Required. The name (path) of the file
     * to load.
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    static loadFromSession (info) {
        return new Promise((resolve, reject) => {
            if (info.name) {
                if (info.sessionid) {
                    // TODO make sencha-mysql options how?
                    const { Batch } = require('@extjs/sencha-mysql'); // eslint-disable-line global-require

                    const {
                        batch = new Batch(),
                        connection
                    } = info;

                    Manager
                        .instantiateOperation('fiddle.asset.get')
                        .getOneFromSession(info.sessionid, info.name, batch)
                        .then(this._instantiate.bind(this, {
                            params : info.params,
                            req    : info.req
                        }))
                        .then(file => file.maybeDelay())
                        .then(file => file.maybeWrap())
                        .then(file => file._handleDynamic())
                        .then(file => file.template())
                        .then(resolve, reject);

                    if (connection) {
                        connection.exec(batch);
                    }
                } else {
                    reject(new Error('No session to load a file from.'));
                }
            } else {
                reject(new Error('No name to load a file.'));
            }
        });
    }

    /**
     * @static
     * @method
     * Load all direct assets for a session.
     * @param {Object} info
     * @param {String} info.sessionid Required. The session id to load
     * a file from.
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    static loadDirectFromSession (info) {
        return new Promise((resolve, reject) => {
            if (info.sessionid) {
                // TODO make sencha-mysql options how?
                const { Batch } = require('@extjs/sencha-mysql'); // eslint-disable-line global-require

                const {
                    batch = new Batch(),
                    connection
                } = info;

                Manager
                    .instantiateOperation('fiddle.mockdata.get')
                    .getAllDirectForSession(info.sessionid, batch)
                    .then(this._instantiate.bind(this, null))
                    .then(resolve)
                    .catch(reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('No session to load a file from.'));
            }
        });
    }

    /**
     * @static
     * @method
     * Load all direct assets for a fiddle.
     * @param {Object} info
     * @param {String} info.fiddleid Required. The fiddle id to load
     * a file from.
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    static loadDirectForFiddle (info) {
        return new Promise((resolve, reject) => {
            if (info.fiddleid) {
                // TODO make sencha-mysql options how?
                const { Batch } = require('@extjs/sencha-mysql'); // eslint-disable-line global-require

                const {
                    batch = new Batch(),
                    connection,
                    fiddleid
                } = info;

                Manager
                    .instantiateOperation('fiddle.mockdata.get')
                    .getAllDirectForFiddle(this.decodeId(fiddleid), batch)
                    .then(this._instantiate.bind(this, null))
                    .then(resolve)
                    .catch(reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('No session to load a file from.'));
            }
        });
    }

    /**
     * @static
     * @method
     * Convenient method to instantiate an instance.
     * @param {Object} config An optional config object.
     * @param {Object/Object[]} data The data to apply onto the config when instantiating
     * an instance.
     * @return {Sencha.fiddle.Fiddle/Sencha.fiddle.Fiddle[]} If an array was passed as the
     * data argument, an array of instances will be returned.
     */
    static _instantiate (config, data) {
        if (Array.isArray(data)) {
            return data.map((item) => this._instantiate(config, item));
        } else {
            return new this(
                Object.assign({
                    data
                }, config)
            );
        }
    }

    /**
     * @static
     * @method
     * Parses an array of flat direct assets array into a proper API descriptor
     * expected by Ext JS.
     * @param {Object[]} assets The array of assets.
     * @return {Object}
     */
    static parseDirectApi (assets) {
        const actions = {};

        assets.forEach((asset) => {
            const { data } = asset;

            const url    = data.url.split('.');
            let   action = actions;

            url.forEach((part, idx) => {
                const obj = action[ part ];

                if (obj) {
                    action = obj;
                } else if (url.length - 1 === idx) {
                    const temp = {
                        len  : data.direct_len,
                        name : part
                    };

                    if (data.formHandler) {
                        temp.formHandler = true;
                    }

                    action.push(temp);
                } else {
                    action = url.length - 2 === idx ? [] : {};

                    actions[ part ] = action;
                }
            });
        });

        return actions;
    }

    /**
     * @property {String} contentType The content type header value for
     * this file depending on the type of file.
     */
    get contentType () {
        return types[ this.data.type ];
    }

    /**
     * Delays returning the file if this file has a delay set on it.
     * @return {Promise}
     */
    maybeDelay () {
        if (this.data.delay > 0) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(this), this.data.delay);
            });
        } else {
            return Promise.resolve(this);
        }
    }

    /**
     * Wraps `app.js` with `Ext.onReady` if the code does not contain a startup
     * wrapping function (`Ext.onReady`, `Ext.application` or `Ext.setup`).
     * @return {Sencha.fiddle.File}
     */
    maybeWrap () {
        const { data } = this;

        if ((data.url === 'app.js' || data.name === 'app.js') && data.extWrap) {
            const { code } = data;

            if (code && !/(Ext\.onReady\(|Ext\.application\(|Ext.setup\()/.test(code)) {
                data.code = `Ext.onReady(function() {\n\n${code}\n\n});`;
            }
        }

        return this;
    }

    /**
     * Takes data, strips the comments and parses it into
     * a string if it was a template.
     * @return {Sencha.fiddle.File}
     */
    template () {
        const { data } = this;

        const prop = data.data ? 'data' : 'code';
        const code = data[ prop ];

        if (typeof code === 'string') {
            const temp = FiddleArg.template(code, {
                params        : this.params,
                stripComments : data.type === 'json'
            });

            if (temp != null) {
                data[ prop ] = temp;
            }
        }

        return this;
    }

    /**
     * @private
     * @return {Sencha.fiddle.File/Promise} Returns a Promise if this file
     * is a dynamic file else will return the `Sencha.fiddle.File` instance.
     */
    _handleDynamic () {
        const { data } = this;

        const prop = data.code ? 'code' : 'data';

        if (data.dynamic) {
            return new Promise((resolve, reject) => {
                const vm   = new VM({
                    timeout : this.scriptTimeout
                });
                const args = this._parseArgs();
                const fn   = vm.run(`let fn = function(${args}) {${data[ prop ]}};fn`);
                let code;

                try {
                    code = fn.apply(vm, this._getExecutionArgs());
                } catch (e) {
                    code = {
                        msg     : e.message,
                        success : false
                    };
                }

                if (code.then) {
                    code
                        .then(code => {
                            data[ prop ] = code;

                            return this;
                        })
                        .then(resolve, reject);
                } else {
                    data[ prop ] = code;

                    resolve(this);
                }
            });
        } else {
            return this;
        }
    }

    /**
     * Returns a string of parameters the dynamic's function
     * will use.
     * @private
     * @return {String}
     */
    _parseArgs () {
        const { data } = this;
        let args = data.direct_args;

        if (args) {
            if (!Array.isArray(args)) {
                args = args.split(',');
            }
        } else if (data.type === 'direct') {
            args = [];
        } else {
            args = [ 'params' ];
        }

        args.push('req', 'Fiddle');

        return args;
    }

    /**
     * Returns an array of arguments to be passed to a dynamic's
     * function execution.
     * @private
     * @return {Array}
     */
    _getExecutionArgs () {
        let { params : args } = this;

        if (this.data.type === 'direct') {
            if (args.data == null) {
                args = [];
            } else if (Array.isArray(args.data)) {
                args = args.data.slice();
            } else {
                args = [ args.data ];
            }
        }

        if (!Array.isArray(args)) {
            args = [ args ];
        }

        if (!args) {
            args = [];
        }

        args.push(this.req, FiddleArg);

        return this._parseExecutionArgs(args);
    }

    /**
     * Parses the arguments recursively. Currently, this only
     * uses the `numberRe` to see if only numbers are present
     * in a string. If so, it will `parseInt` the argument.
     * @param {*} args An array of arguments to parse over.
     * @return {*}
     */
    _parseExecutionArgs (args) {
        if (args) {
            if (Array.isArray(args)) {
                const { length } = args;
                let   i          = 0;

                for (; i < length; i++) {
                    args[ i ] = this._parseExecutionArgs(args[ i ]);
                }
            } else if (typeof args === 'object') {
                for (const name in args) {
                    args[ name ] = this._parseExecutionArgs(args[ name ]);
                }
            } else if (typeof args === 'string' && numberRe.test(args)) {
                args = parseInt(args);
            }
        }

        return args;
    }
}

module.exports = File;
