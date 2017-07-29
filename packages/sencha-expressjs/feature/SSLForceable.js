const { Mixin } = require('@extjs/sencha-core');

const http     = require('http');
const parseUrl = require('url').parse;

/**
 * @class Sencha.express.feature.SSLForceable
 * @extends Sencha.core.Mixin
 *
 * A mixin for {@link Sencha.express.SSLServer} to start up a
 * {@link Sencha.express.Server} to then redirect non-secure
 * requests to a secure request.
 */
class SSLForceable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isSSLForceable
                 */
                isSSLForceable : true,

                /**
                 * @protected
                 * @property {Sencha.express.Server} insecureApp If {@link #forceFromPort}
                 * is set, the {@link Sencha.express.Server} instance will be instantiated
                 * to this property.
                 */

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Number} [forceFromPort=80] The port the
                     * non-secure {@link Sencha.express.Server} will
                     * listen for non-secure requests on.
                     */
                    forceFromPort : null,

                    /**
                     * @cfg {Number} forceToPort The port the non-secure
                     * requests will be redirected to. This will default to
                     * {@link Sencha.express.SSLServer#port}.
                     */
                    forceToPort : null,

                    startInsecureApp : false
                }
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `before-app` trigger watcher to add the non-secure request
     * detection middleware to the {@link Sencha.express.Server} instance.
     *
     * Adds a `after-app` trigger watcher to instantiate the {@link Sencha.express.Server}.
     */
    static onMixedIn (cls) {
        cls.addWatcher('before-app', (info, instance) => {
            if (!instance.startInsecureApp || instance.forceFromPort && info.preventMiddlewares) {
                info.middlewares.unshift(instance.forceSSLMiddleware({
                    port : instance.forceToPort || instance.port
                }));
            }
        });

        cls.addWatcher('after-app', (app, instance) => {
            if (instance.forceFromPort && !instance.insecureApp && instance.startInsecureApp) {
                instance.createInsecureServer();
            }
        });
    }

    /**
     * @protected
     *
     * Instantiate the {@link Sencha.express.Server} and prevent any other middlewares
     * that were added to the {@link Sencha.express.SSLServer}. This will also depend
     * on {@link Sencha.express.Server#autoListen} to automatically start the listening.
     * To manually start listening, you would need to execute the {@link Sencha.express.Server#listen}
     * method:
     *
     *     server.listen(server.insecureApp, server.forceFromPort);
     */
    createInsecureServer () {
        const me = this;

        const app = me.createApp('insecureApp', {
            preventMiddlewares : true
        });

        me.triggerWatchers('before-server', app);

        const server = http.Server(app); // eslint-disable-line new-cap

        me.insecureServer = server;

        me.triggerWatchers('after-server', server);

        if (me.autoListen) {
            me.listen('insecureServer', me.insecureApp, me.forceFromPort);
        }
    }

    /**
     * @protected
     * @param {Object} req The raw request object from the express server to
     * check if it was a secure request. This will check the `HTTP_X_FORWARDED_PROTO`
     * and `X-Forwarded-Proto` headers along with `req.secure` to determine if is a
     * secure request.
     */
    isSecureRequest (req) {
        if (req.secure || req.method === 'OPTIONS') {
            // req.protocol === 'https'
            return true;
        } else {
            // check forwarded headers
            let forwarded_proto = req.get('HTTP_X_FORWARDED_PROTO'); // eslint-disable-line camelcase

            if (!forwarded_proto) { // eslint-disable-line camelcase
                forwarded_proto = req.get('X-Forwarded-Proto'); // eslint-disable-line camelcase
            }

            if (forwarded_proto && forwarded_proto.toLowerCase() === 'https') { // eslint-disable-line camelcase
                return true;
            }
        }

        return false;
    }

    /**
     * @protected
     * @param {Object} config An optional configuration object to configure the
     * port, protocol and url the request will be redirected to.
     */
    forceSSLMiddleware (config) {
        return (req, res, next) => {
            if (this.isSecureRequest(req)) {
                next();
            } else if (req.method === 'GET') {
                let { port = 443, url } = config;

                const { protocol = 'https://' } = config;

                if (config.showError) {
                    config.showError(req, res);
                } else {
                    if (url) {
                        url = parseUrl(`${req.protocol}://${url}`);

                        req.url = url.path;
                    } else {
                        url = parseUrl(`${req.protocol}://${req.header('Host')}${req.originalUrl}`);
                    }

                    if (port === 443) {
                        // 443 is default, no need to have it on the url
                        port = '';
                    } else {
                        port = `:${port}`;
                    }

                    if (typeof url === 'object') {
                        url = url.hostname;
                    }

                    res.redirect(301, protocol + url + port + req.url);
                }
            } else {
                res.status(403).send('SSL Required.');
            }
        };
    }
}

module.exports = SSLForceable;
