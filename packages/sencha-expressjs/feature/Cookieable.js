const { Mixin } = require('@extjs/sencha-core');

const cookieParser = require('cookie-parser');

/**
 * @class Sencha.express.feature.Cookieable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the [cookie-parser](https://www.npmjs.com/package/cookie-parser)
 * module to the {@link Sencha.express.Server}. This allows for cookies in the
 * request to be parsed.
 */
class Cookieable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isCookieable
                 */
                isCookieable : true

                /**
                 * @cfg {Object} cookie The configuration object to pass to the
                 * cookie-parser module.
                 */
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `before-app` trigger watcher to mix the cookie-parser module into
     * the express server.
     */
    static onMixedIn (cls) {
        cls.addWatcher('before-app', (info, instance) => {
            const settings = instance.cookie;

            if (settings && !info.preventMiddlewares) {
                let options, secret;

                if (typeof settings === 'object') {
                    secret  = settings.secret;  // eslint-disable-line prefer-destructuring
                    options = settings.options; // eslint-disable-line prefer-destructuring
                }

                info.middlewares.push(cookieParser(secret, options));
            }
        });
    }
}

module.exports = Cookieable;
