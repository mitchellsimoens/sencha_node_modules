const { BaseRoute } = require('./');

/**
 * @class Sencha.express.route.Route
 * @extends Sencha.core.Base
 *
 * A route class that can handle endpoints on the express server.
 */
class Route extends BaseRoute {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressRoute
                 */
                isExpressRoute : true
            }
        };
    }

    /**
     * @protected
     * @param {String} [func=handle] The function on this route to execute
     * when this route is hit.
     */
    createHandler (func = 'handle') {
        return (req, res) => {
            const responder = this.createResponder(res);

            this[ func ](req, res)
                .then(responder, responder)
                .catch(this.createUncaughtHandler(res));
        };
    }
}

module.exports = Route;
