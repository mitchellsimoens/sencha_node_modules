const { Mixin } = require('@extjs/sencha-core');

const cors = require('cors');

const regexEx = /^\/(.+)\/(\w{0,3})$/;

/**
 * @class Sencha.express.feature.Corsable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the [cors](https://www.npmjs.com/package/cors)
 * module to the {@link Sencha.express.Server}.
 */
class Corsable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isCorsable
                 */
                isCorsable : true

                /**
                 * @cfg {Object} cors A configuration object to enable cors.
                 * This accepts the options listed [cors](https://www.npmjs.com/package/cors).
                 *
                 * Example:
                 *
                 *     cors : {
                 *         credentials          : true,
                 *         optionsSuccessStatus : 200
                 *     }
                 *
                 * The only thing that is parsed is if the `origin` is a string, it will
                 * check if it's a RegExp (starts with `/` and has `/` at the end with optional
                 * modifiers like `i`). Example:
                 *
                 *     cors : {
                 *         credentials          : true,
                 *         optionsSuccessStatus : 200,
                 *         origin               : '/^https?:\\/\\/localhost(?::\d+)?/i'
                 *     }
                 *
                 * The origin will get created into `new RegExp('^https?:\\/\\/localhost(?::\d+)?', 'i')`.
                 */
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `before-app` trigger watcher to mix the cors module into
     * the express server.
     */
    static onMixedIn (cls) {
        cls.addWatcher('before-app', (info, instance) => {
            const { cors : settings } = instance;

            if (settings && !info.preventMiddlewares) {
                const { middlewares } = info;

                if (settings.origin && typeof settings.origin == 'string') {
                    const matches = settings.origin.match(regexEx);

                    if (matches) {
                        settings.origin = new RegExp(matches[ 1 ], matches[ 2 ]);
                    }
                }

                middlewares.push(cors(settings));
            }
        });
    }
}

module.exports = Corsable;
