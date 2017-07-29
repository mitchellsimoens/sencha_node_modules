const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.express.route.Router
 * @extends Sencha.core.Base
 *
 * A router class to manage routes that get applied to the
 * {@link Sencha.express.Server}.
 */
class Router extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressRouter
                 */
                isExpressRouter : true

                /**
                 * @cfg {Object} routes The object of routes. This is a key-value
                 * pair where the key is the url endpoint and the value is the route.
                 * If the value is a string, it is expected to be a path to that route
                 * class to be instantiated.
                 */
            }
        };
    }

    /**
     * @protected
     * @property {Object} app The actual express server from the attached
     * {@link Sencha.express.Server}.
     */
    get app () {
        return this.server.app;
    }

    get routes () {
        return this._routes;
    }

    set routes (routes) {
        if (routes) {
            for (const url in routes) {
                let route = routes[ url ];

                if (typeof route === 'string') {
                    route = new (require(route))(); // eslint-disable-line global-require

                    routes[ url ] = route;
                }

                route.url = url;
            }

            this._routes = routes;
        }
    }

    /**
     * Connects all the routes to this router.
     */
    init () {
        const { routes } = this;

        if (routes) {
            for (const url in routes) {
                routes[ url ].connect(this);
            }
        }
    }
}

module.exports = Router;
