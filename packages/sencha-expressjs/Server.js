const { Base, Config } = require('@extjs/sencha-core');
const { Console }      = require('@extjs/sencha-debug');
const debug            = Console.find('server');

const express = require('express');
const http    = require('http');
const path    = require('path');

/**
 * @class Sencha.express.Server
 * @extends Sencha.core.Base
 *
 * A class to manage starting a non-secure express server.
 *
 * For secure server, please use {@link Sencha.express.SSLServer}.
 */
class Server extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressServer
                 */
                isExpressServer : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Boolean} [autoListen=true] If `true`, will automatically
                     * start the express server listening when the server is instantiated.
                     */
                    autoListen : true,

                    /**
                     * @cfg {Boolean} [autoStart=false] If `true`, will automatically instantiate
                     * the express server when this Server class is instantiated.
                     */
                    autoStart : false,

                    /**
                     * @cfg {Boolean} [disablePoweredBy=false] If `true`, will prevent the express
                     * server from sending the `X-Powered-By` header on responses.
                     */
                    disablePoweredBy : false,

                    /**
                     * @cfg {String} [host=localhost] The host this server is started on. This is only
                     * used in the `console.log` when the express server's listen method is called.
                     */
                    host : 'localhost',

                    /**
                     * @cfg {Number} port The port the express server should listen on.
                     */
                    port : null

                    /**
                     * @cfg {Object} settings An object of settings to use the
                     * [`set`](http://expressjs.com/en/4x/api.html#app.set) method on the express app.
                     *
                     * If `views` is specified, it should be relative to the `appRoot`.
                     */
                }
            }
        };
    }

    ctor () {
        const me = this;

        if (me.autoStart) {
            me.start();
        }
    }

    dtor () {
        const { server } = this;

        if (server) {
            server.close();
        }

        Object.assign(this, {
            app       : null,
            listening : null,
            server    : null
        });
    }

    /**
     * @private
     * @property {Object} app The raw express server.
     */
    get app () {
        let { _app : app } = this;

        if (!app) {
            app = this.createApp();
        }

        return app;
    }

    set app (app) {
        this._app = app;
    }

    /**
     * Instantiates the express server (if one is not already created). If {@link #autoListen} is `true`,
     * will execute the {@link #listen} method.
     */
    start () {
        const { app } = this;

        if (this.autoListen) {
            this.listen(undefined, app);
        }
    }

    /**
     * @protected
     * @param {String} [prop=app] The property name to cache the
     * instaniated express server to.
     * @param {Object} triggerConfig An option object to pass to the
     * `before-app` trigger watchers.
     */
    createApp (prop = 'app', triggerConfig) {
        const me          = this;
        const app         = express();
        const middlewares = [];

        if (me.disabledPoweredBy) {
            app.disable('x-powered-by');
        }

        me.initSettings(app);

        me.triggerWatchers('before-app', Object.assign({}, triggerConfig, {
            app,
            middlewares
        }));

        if (middlewares.length) {
            app.use(middlewares);
        }

        me[ prop ] = app;

        me.triggerWatchers('after-app', app);

        return app;
    }

    /**
     * @protected
     * @param {Object} app The express application to create a server with.
     */
    createServer (app = this.app) {
        return http.createServer(app);
    }

    /**
     * @param {Object} [app=this.app] The app to start the listening on.
     * @param {Number} [port=this.port] The port to listen on.
     */
    listen (prop = 'server', app = this.app, port = this.port) {
        const me = this;
        let   server;

        me.triggerWatchers('before-server', app);

        if (!me[ prop ]) {
            server = me.createServer(app);

            me[ prop ] = server;
        }

        me.triggerWatchers('after-server', server);

        me.triggerWatchers('before-listen', app);

        me[ prop ].listen(port, () => {
            me.listening = true;

            debug.log('Server listening on', `${me.host}:${port}`);

            me.triggerWatchers('after-listen', app);
        });
    }

    initSettings (app, settings = this.settings) {
        if (app && settings) {
            const { appRoot } = Config;

            for (const name in settings) {
                let value = settings[ name ];

                if (name === 'views') {
                    value = path.join(appRoot, value);
                }

                app.set(name, value);
            }
        }
    }
}

module.exports = Server;
