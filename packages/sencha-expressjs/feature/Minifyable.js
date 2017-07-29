const { Mixin } = require('@extjs/sencha-core');

const minify = require('express-minify');

/**
 * @class Sencha.express.feature.BodyParserable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the [express-minify](https://www.npmjs.com/package/express-minify)
 * module to the {@link Sencha.express.Server}. This allows for responses to be minified.
 */
class Minifyable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isMinifyable
                 */
                isMinifyable : true

                /**
                 * @cfg {Object} minify A configuration object to pass to the
                 * [express-minify](https://www.npmjs.com/package/express-minify)
                 * package
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
            const {
                minify : settings
            } = instance;

            if (settings && !info.preventMiddlewares) {
                const {
                    middlewares
                } = info;

                middlewares.push(minify(settings));
            }
        });
    }
}

module.exports = Minifyable;
