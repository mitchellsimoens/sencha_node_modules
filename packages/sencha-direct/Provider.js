const path = require('path');

const { Action }       = require('./');
const { Base, Config } = require('@extjs/sencha-core');

class Provider extends Base {
    static get meta () {
        return {
            mixins : [
                '@extjs/sencha-core/Managerable'
            ],

            prototype : {
                /**
                 * @property {Boolean} isDirectProvider
                 */
                isDirectProvider : true,

                /**
                 * @cfg {Object} actions
                 * The individual actions to add to this provider. The key should
                 * be the namespace with the value being an object of individual
                 * actions.
                 */

                /**
                 * @cfg {Number} maxRetries
                 * The number of max retries for failed requests.
                 */

                /**
                 * @cfg {String} url
                 * The url to send route requests to. On manager?
                 */

                /**
                 * @cfg {Array} serializeProps The properties to include when serializing the provider.
                 */
                serializeProps : [
                    'bufferLimit',
                    'enableBuffer',
                    'enableUrlEncode',
                    'id',
                    'maxRetries',
                    'namespace',
                    'timeout',
                    'type',
                    'url'
                ],

                /**
                 * @cfg {String} type
                 * The type of provider. Currently, only supported types are:
                 *
                 *  - `polling`
                 *  - `remoting`
                 */
                type : 'remoting'
            }
        };
    }

    static get baseInstance () {
        return {
            beArray  : true,
            cls      : Action,
            property : 'isDirectAction'
        };
    }

    get actions () {
        return this.get();
    }

    set actions (actions) {
        if (actions) {
            this.add(actions);
        } else {
            this.remove();
        }
    }

    get serialize () {
        const instances = this.get();
        const actions   = {};
        const ret       = {};
        const props     = this.serializeProps;

        props.forEach((prop) => {
            if (this[ prop ] != null) {
                ret[ prop ] = this[ prop ];
            }
        });

        ret.actions = actions;

        for (const [ namespace, arr ] of instances) {
            actions[ namespace ] = arr.map(action => action.serialize);
        }

        return ret;
    }

    add (name, item, baseInfo = this.constructor.baseInstance) {
        if (!item && typeof name === 'object') {
            for (const namespace in name) {
                const methods = name[ namespace ];

                for (const name in methods) {
                    const localInfo = Object.assign({}, baseInfo);
                    let config      = methods[ name ];

                    if (typeof config === 'string') {
                        localInfo.cls = require(path.join(Config.appRoot, 'app', config)); // eslint-disable-line global-require

                        config = {
                            name
                        };
                    } else if (!config.isInstance) {
                        config.name = name;
                    }

                    this.mixins.managerable.add.call(
                        this,
                        namespace,
                        config,
                        localInfo
                    );
                }
            }
        } else {
            this.mixins.managerable.add.call(this, name, item, baseInfo);
        }
    }

    findAction (name, method) {
        const actions = this.get(name);

        if (actions) {
            return actions.find(action => {
                if (action.name === method) {
                    return action;
                }

                return null;
            });
        }
    }
}

module.exports = Provider;
