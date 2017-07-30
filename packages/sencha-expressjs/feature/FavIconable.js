const { Config, Mixin } = require('@extjs/sencha-core');

const favicon = require('serve-favicon');
const path    = require('path');

/**
 * @class Sencha.express.feature.FavIconable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the [serve-favicon](https://www.npmjs.com/package/serve-favicon)
 * module to the {@link Sencha.express.Server}. This allows for a favicon to be
 * served automatically.
 */
class FavIconable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFavIconable
                 */
                isFavIconable : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {String} favicon The path to the actual favicon to be served.
                     * The path should be relative to the `appRoot`.
                     */
                    favicon : null
                }
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `before-app` trigger watcher to mix the serve-favicon module into
     * the express server.
     */
    static onMixedIn (cls) {
        cls.addWatcher('before-app', (info, instance) => {
            if (instance.favicon && !info.preventMiddlewares) {
                info.middlewares.push(favicon(instance.favicon));
            }
        });
    }

    applyFavicon (favicon) {
        const { appRoot } = Config;

        if (appRoot) {
            favicon = path.join(Config.appRoot, favicon);
        }

        return favicon;
    }
}

module.exports = FavIconable;
