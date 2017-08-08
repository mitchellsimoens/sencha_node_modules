const { BaseRoute } = require('./');
const { Config }    = require('@extjs/sencha-core');

const express = require('express');
const path    = require('path');

/**
 * @class Sencha.express.route.SimpleRoute
 */
class SimpleRoute extends BaseRoute {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressSimpleRoute
                 */
                isExpressSimpleRoute : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Object/String} dir The directory to serve from. If an object,
                     * expected a key should match an environment to have different directories
                     * for each environment.
                     *
                     * Should be relative to the `appRoot` config or `process.cwd()`.
                     */
                    dir : null,

                    /**
                     * @cfg {Object} options An options object to pass to the
                     * [`express.static`](http://expressjs.com/en/4x/api.html#express.static) method.
                     */
                    options : null
                }
            }
        };
    }

    applyDir (dir) {
        if (dir) {
            const { appRoot } = Config;

            if (typeof dir === 'object') {
                dir = dir[ Config.env ];
            }

            dir = path.resolve(appRoot, dir);
        }

        return dir;
    }

    /**
     * @protected
     * @param {Sencha.express.route.Router} router The router class to attach this route to.
     */
    connect (router) {
        const { app } = router;

        app.use(this.url, this.connectMiddleware());
    }

    /**
     * @protected
     * @return {Function} The function to pass to `app.use()`.
     */
    connectMiddleware (dir = this.dir, options = this.options) {
        return express.static(dir, options);
    }
}

module.exports = SimpleRoute;
