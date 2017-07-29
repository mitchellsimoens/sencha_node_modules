// assumes sencha-expressjs is required
const { route : { Route } }          = require('@extjs/sencha-expressjs');
const { Manager, route : { Mixin } } = require('../');

/**
 * @class Sencha.express.route.Express
 *
 * A route to handle the Ext.Direct router calls from
 * an Express server.
 *
 * It is assumed to have `sencha-expressjs` module already
 * included in your `package.json` in your project.
 */
class Express extends Route {
    static get meta () {
        return {
            mixins : [
                Mixin
            ],

            prototype : {
                /**
                 * @property {Boolean} isDirectExpressRoute
                 */
                isDirectExpressRoute : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {String} apiVariable If set to a string, this will
                     * prefix the {@link #api} for output and execute as JavaScript.
                     */
                    method : {
                        GET  : 'api',
                        POST : 'router'
                    }
                }
            }
        };
    }

    api () {
        return new Promise((resolve) => {
            const apiVariable = this.apiVariable || Manager.apiVariable;
            let   { api }     = Manager,
                opts;

            if (apiVariable) {
                api  = `${apiVariable}=${JSON.stringify(api)};`;
                opts = {
                    headers : {
                        ContentType : 'application/javascript'
                    },
                    isView : false
                };
            }

            const response = this.createResponse(
                null,
                api,
                opts
            );

            resolve(response);
        });
    }

    router (req, res) {
        return new Promise((resolve, reject) => {
            const info  = this.getInfo(req.body);
            const extra = {
                req,
                res
            };

            Manager
                .dispatch(info, extra)
                .then(
                    this.createResolver(info, resolve),
                    this.createResolver(info, reject)
                );
        });
    }
}

module.exports = Express;
