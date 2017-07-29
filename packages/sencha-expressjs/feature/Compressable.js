const { Mixin } = require('@extjs/sencha-core');

const compression = require('compression');

/**
 * @class Sencha.express.feature.Compressable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the [compress](https://www.npmjs.com/package/compression)
 * module to the {@link Sencha.express.Server}. This allows for gzipping
 * responses.
 */
class Compressable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isCompressable
                 */

                isCompressable : true
                /**
                 * @cfg {Object} compress The configuration object to pass
                 * to the compression module.
                 */
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `before-app` trigger watcher to mix the compression module into
     * the express server.
     */
    static onMixedIn (cls) {
        cls.addWatcher('before-app', (info, instance) => {
            if (instance.compress && !info.preventMiddlewares) {
                info.middlewares.push(compression(instance.compress));
            }
        });
    }
}

module.exports = Compressable;
