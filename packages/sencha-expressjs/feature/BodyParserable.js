const { Mixin } = require('@extjs/sencha-core');

const bodyParser = require('body-parser');

/**
 * @class Sencha.express.feature.BodyParserable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the [body-parser](https://www.npmjs.com/package/body-parser)
 * module to the {@link Sencha.express.Server}. This allows for form submissions
 * to be parsed.
 */
class BodyParserable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isBodyParserable
                 */
                isBodyParserable : true

                /**
                 * @cfg {Object} bodyParser A configuration object to enable the
                 * different body parsers. This is a key-value pair where the key
                 * is the method on the body-parser module and the value is the
                 * the configuration to pass into that method.
                 *
                 * Example:
                 *
                 *     bodyParser : {
                 *         json       : {
                 *             limit : '500kb'
                 *         },
                 *         urlencoded : {
                 *             parameterLimit : 500
                 *         }
                 *     }
                 */
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `before-app` trigger watcher to mix the body-parser module into
     * the express server.
     */
    static onMixedIn (cls) {
        cls.addWatcher('before-app', (info, instance) => {
            const { bodyParser : settings } = instance;

            if (settings && !info.preventMiddlewares) {
                const { middlewares } = info;

                for (const method in settings) {
                    if (bodyParser[ method ]) {
                        middlewares.push(
                            bodyParser[ method ](settings[ method ])
                        );
                    }
                }
            }
        });
    }
}

module.exports = BodyParserable;
