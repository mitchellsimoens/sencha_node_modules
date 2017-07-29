const { Config, Mixin } = require('@extjs/sencha-core');
const { Router }        = require('./');

const path = require('path');

/**
 * @class Sencha.express.route.Routerable
 * @extends Sencha.core.Mixin
 *
 * A mixin to allow any class (tho normally {@link Sencha.express.Server}) to
 * attach routes to.
 */
class Routerable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isRouterable
                 */
                isRouterable : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Boolean} [autoInitRouter=true] If `true`, automatically
                     * initialize the router in the `after-app` trigger. To manually
                     * initialize the router, you will need to call the
                     * {@link Sencha.express.router.Router#init} method:
                     *
                     *     server.router.init();
                     */
                    autoInitRouter : true

                    /**
                     * @cfg {Object/Sencha.express.route.Router} router The router
                     * to attach the {@link #routes} to.
                     */
                    /**
                     * @cfg {Object} route The routes to attach to the {@link #router}.
                     * Each route should be relative to the `appRoot` config or `process.cwd()`.
                     */
                }
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     *
     * Adds a `after-app` trigger watcher to initialize the router.
     */
    static onMixedIn (cls) {
        cls.addWatcher('after-app', (app, instance) => {
            instance.router.init();
        });
    }

    get router () {
        let router = this._router;

        if (!router) {
            this.router = null;

            router = this._router;
        }

        return router;
    }

    set router (router) {
        if (!router) {
            router = {};
        }

        router.server = this;

        if (!router.isExpressRouter) {
            router = new Router(router);
        }

        this._router = router;
    }

    get routes () {
        return this.router.routes;
    }

    set routes (routes) {
        this.router.routes = routes;
    }

    applyRoutes (routes) {
        if (routes) {
            const { appRoot } = Config;

            for (const url in routes) {
                routes[ url ] = path.join(appRoot, routes[ url ]);
            }
        }

        return routes;
    }
}

module.exports = Routerable;
