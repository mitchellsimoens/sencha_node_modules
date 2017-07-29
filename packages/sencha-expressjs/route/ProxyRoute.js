const { BaseRoute } = require('./');

const Proxy = require('express-http-proxy');
const Url   = require('url');

// TODO
class ProxyRoute extends BaseRoute {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressProxyRoute
                 */
                isExpressProxyRoute : true
            }
        };
    }

    connect (router) {
        if (this.proxyUrl) {
            this.connectStatic(router);
        } else {
            this.connectDynamic(router);
        }
    }

    connectStatic (router) {
        router.app.use(
            this.url,
            Proxy( // eslint-disable-line new-cap
                this.proxyUrl,
                {
                    decorateRequest : (proxyReq) => {
                        const { auth } = this;

                        if (auth) {
                            proxyReq.headers.Authorization = `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
                        }

                        return proxyReq;
                    },

                    filter : req => req.method == 'GET',

                    forwardPathAsync : (req) => new Promise(resolve => {
                        // TODO check permission in func???
                        resolve(req.params[ 0 ]);
                    }),

                    https : true,

                    intercept : (rsp, data, req, res, callback) => {
                        const headers = res.headers || (res.headers = {});

                        headers[ 'content-type' ] = rsp.headers[ 'content-type' ];

                        callback(null, data);
                    }
                }
            )
        );
    }

    connectDynamic (router) {
        router.app.use(
            this.url,
            (req, res, next) => {
                const parsed = Url.parse(req.params[ 0 ]);

                if (parsed) {
                    Proxy( // eslint-disable-line new-cap
                        parsed.host,
                        {
                            filter           : req => req.method == 'GET',
                            forwardPathAsync : () => new Promise(resolve => {
                                resolve(parsed.path);
                            }),
                            intercept : (rsp, data, req, res, callback) => {
                                const headers = res.headers || (res.headers = {
                                });

                                headers[ 'content-type' ] = rsp.headers[ 'content-type' ];

                                callback(null, data);
                            }
                        }
                    )(req, res, next);
                } else {
                    next();
                }
            }
        );
    }
}

module.exports = ProxyRoute;
