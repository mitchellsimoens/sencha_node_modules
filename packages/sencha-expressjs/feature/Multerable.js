const { Mixin } = require('@extjs/sencha-core');

const multer = require('multer');
const os     = require('os');

/**
 * @class Sencha.express.feature.Multerable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the [multer](https://www.npmjs.com/package/multer)
 * module to the {@link Sencha.express.Server}. This allows for file uploads
 * to be handled.
 */
class Multerable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isMulterable
                 */
                isMulterable : true

                /**
                 * @cfg {Object} multer The configuration object to configure
                 * the multer module.
                 */
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `before-app` trigger watcher to mix the multer module into
     * the express server.
     */
    static onMixedIn (cls) {
        cls.addWatcher('before-app', (info, instance) => {
            let settings = instance.multer;

            if (settings && !info.preventMiddlewares) {
                settings = Object.assign({}, settings);

                const { fields }      = settings;
                const { middlewares } = info;

                delete settings.fields;

                if (!settings.inMemory && !settings.dest) {
                    settings.dest = os.tmpdir();
                }

                instance = multer(instance);

                if (fields) {
                    middlewares.push(instance.fields(fields));
                } else {
                    middlewares.push(instance.array());
                }
            }
        });
    }
}

module.exports = Multerable;
