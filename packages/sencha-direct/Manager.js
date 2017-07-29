const { Base }     = require('@extjs/sencha-core');
const { Provider } = require('./');

/**
 * @class Sencha.direct.Manager
 * @extends Sencha.core.Base
 * @singleton
 *
 * A manager class to manage Ext.Direct providers. This will also allow the api
 * description to be returned to the client and a means to dispatch requests to the
 * appropriate {@link Sencha.direct.Action}.
 */
class Manager extends Base {
    static get meta () {
        return {
            mixins : [
                '@extjs/sencha-core/event/Observable', // eslint-disable-line array-element-newline
                '@extjs/sencha-core/Managerable'
            ],

            prototype : {
                /**
                 * @property {Boolean} isDirectManager
                 */
                isDirectManager : true

                /**
                 * @cfg {String} apiVariable If set to a string, this will
                 * prefix the {@link #api} for output and execute as JavaScript.
                 *
                 * For more, see {@link #api}.
                 */

                /**
                 * @cfg {String} url
                 */
            }
        };
    }

    static get baseInstance () {
        return {
            cls      : Provider,
            property : 'isDirectProvider'
        };
    }

    get types () {
        return {
            polling  : 1,
            remoting : 1
        };
    }

    get providers () {
        return this.get();
    }

    set providers (providers) {
        if (providers) {
            this.add(providers);
        } else {
            this.remove();
        }
    }

    add (type, item, baseInfo = this.constructor.baseInstance) {
        if (typeof type === 'string' && !this.types[ type ]) {
            throw new Error(`The direct type ("${type}") is not recognized.`);
        }

        this.mixins.managerable.add.call(this, type, item, baseInfo);
    }

    /**
     * @property {Array/Object/String} api
     * The api description of the provider(s). This will be an Array unless there is only
     * one provider in which case it will return an object. If {@link #apiVariable} is set,
     * this will stringify the api description and prefix this with that variable.
     */
    get api () {
        const { providers, url } = this;
        let   ret                = [];

        for (const [ type, provider ] of providers) {
            const serialized = provider.serialize;

            serialized.type = type;
            serialized.url  = url;

            ret.push(serialized);
        }

        if (ret.length === 1) {
            [ ret ] = ret;
        }

        return this.apiVariable ? `${this.apiVariable}=${JSON.stringify(ret)};` : ret;
    }

    /**
     * @param {String} action The action name.
     * @param {String} method The action's method name.
     * @return {Sencha.direct.Action}
     */
    findAction (action, method) {
        const instances = this.get();

        for (const [ type, provider ] of instances) { // eslint-disable-line no-unused-vars
            const temp = provider.findAction(action, method);

            if (temp) {
                return temp;
            }
        }
    }

    /**
     * @param {Object} params The parameters to dispatch an action.
     * @param {Object} extra Any extra information to pass to the action
     * handlers.
     */
    dispatch (params, extra) {
        return new Promise((resolve, reject) => {
            const action = this.findAction(params.action, params.method);

            if (action) {
                const args           = action.getArgs(params.data);
                const handlerPromise = action.handle(args, params, extra);
                const eventPromise   = this.fire({
                    action,
                    args,
                    extra,
                    params,
                    type : 'directaction'
                });

                Promise
                    .all([ handlerPromise, eventPromise ])
                    .then(this.finishDispatch.bind(this))
                    .then(resolve, reject);
            } else {
                this
                    .fire({
                        action,
                        args : params.data,
                        extra,
                        params,
                        type : 'directaction'
                    })
                    .then(resolve, reject);
            }
        });
    }

    finishDispatch (result) {
        let ret = this.flatten(...result);

        if (ret.length === 1) {
            [ ret ] = ret;
        }

        return ret;
    }

    flatten (...args) {
        // use a set for uniqueness
        const set = new Set();

        if (args.length) {
            args.forEach(arg => {
                if (arg != null) {
                    if (Array.isArray(arg)) {
                        if (arg.length) {
                            arg.forEach(set.add.bind(set));
                        }
                    } else {
                        set.add(arg);
                    }
                }
            });
        }

        return [ ...set ];
    }
}

module.exports = new Manager();
