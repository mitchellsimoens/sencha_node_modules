const { Base }     = require('@extjs/sencha-core');
const { Response } = require('../');

const regexEx = /^\/(.+)\/(\w{0,3})$/;

class BaseRoute extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressBaseRoute
                 */
                isExpressBaseRoute : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {String/Object} [method=GET] The HTTP method to listen to.
                     * This can be an object to support multiple methods.
                     *
                     * Example:
                     *
                     *     method : {
                     *         GET     : 'handle',
                     *         OPTIONS : 'handleOptions'
                     *     }
                     *
                     * This call also be a wildcard to listen to all methods:
                     *
                     *     method : '*'
                     *
                     * For more, see {@link #createFunc}.
                     */
                    method : 'GET',

                    /**
                     * @cfg {String/RegExp} url The url endpoint to listen to. The string could
                     * be a RegExp string that will be turned into a RegExp object. It should match
                     * this RegExp test:
                     *
                     *     /^\/(.+)\/(\w*)$/
                     */
                    url : null
                }
            }
        };
    }

    applyUrl (url) {
        if (url && typeof url === 'string') {
            const matches = url.match(regexEx);

            if (matches) {
                url = new RegExp(matches[ 1 ], matches[ 2 ]);
            }
        }

        return url;
    }

    get url () {
        return this._url;
    }

    set url (url) {
        this._url = this.applyUrl(url);
    }

    /**
     * @protected
     * @param {Sencha.express.route.Router} router The router class to attach this route to.
     */
    connect (router) {
        const { app }    = router;
        const route      = app.route(this.url);
        let   { method } = this;

        if (typeof method === 'string') {
            method = this.resolveMethod();

            route[ method ](this.createHandler());
        } else {
            for (const name in method) {
                route[ this.resolveMethod(name) ](this.createHandler(method[ name ]));
            }
        }
    }

    /**
     * @protected
     * @param {String} method The method to attach the route onto.
     */
    resolveMethod (method = this.method) {
        return method === '*' ? 'all' : method.toLowerCase();
    }

    /**
     * @protected
     * @param {String/Error} error The error occurred when handling this route.
     * @param {Mixed} data The data to return on successful handling of this route.
     * @param {Object} extra Any extra information the {@link Sencha.express.Response}
     * instance will need when it sends the response back to the client.
     */
    createResponse (error, data, extra) {
        return new Response({
            data,
            error,
            extra
        });
    }

    /**
     * @protected
     * @param {Object} res The raw response object from the express server.
     *
     * This will take the {@link Sencha.express.Response} instance created by the
     * {@link #createResponse} method and allows it to respond to the response object
     * from the express server.
     */
    createResponder (res) {
        return (response) => {
            if (!response || !response.isExpressResponse) {
                if (response instanceof Error) {
                    response = this.createResponse(response);
                } else {
                    response = this.createResponse(null, response);
                }
            }

            response.output(res);
        };
    }

    /**
     * @protected
     * @param {Object} res The raw response object from the express server.
     *
     * This will create a {@link Sencha.express.Response} instance and output
     * the error.
     */
    createUncaughtHandler (res) {
        return (e) => {
            this.createResponse(e).output(res);
        };
    }
}

module.exports = BaseRoute;
