const { Mixin } = require('@extjs/sencha-core');

const Server = require('../Server');

/**
 * @class Sencha.express.feature.Expressable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the ability to start up {@link Sencha.express.Server} instances
 * on any class.
 */
class Expressable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressable
                 */
                isExpressable : true

                /**
                 * @cfg {Object/Sencha.express.Server} server The server to add to this
                 * class. If an object, will create a {@link Sencha.express.Server} instance.
                 * The configuration object may control what actual class is created by setting
                 * the `xclass` key to the actual class.
                 */
            }
        };
    }

    get server () {
        return this._server;
    }

    set server (server) {
        if (server) {
            if (!server.isExpressServer) {
                server = new (server.xclass ? server.xclass : Server)(server);
            }

            this._server = server;
        }
    }
}

module.exports = Expressable;
