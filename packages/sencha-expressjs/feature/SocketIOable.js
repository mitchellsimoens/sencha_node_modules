const { Mixin } = require('@extjs/sencha-core');

const socketIO = require('socket.io');

/**
 * @class Sencha.express.feature.SocketIOable
 * @extends Sencha.core.Mixin
 *
 * Adds the ability for a {@link Sencha.express.Server} to also
 * startup a [socket.io](http://http://socket.io/) server to listen
 * to [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).
 */
class SocketIOable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isSocketIOable
                 */
                isSocketIOable : true
            }
        };
    }

    /**
     * @param {Sencha.Class} cls The class this mixin is being mixed into.
     * @static
     *
     * Adds a `after-app` trigger watcher to startup a socket.io server on
     * {@link Sencha.express.Server} but not {@link Sencha.express.SSLServer}.
     * For SSLServer instances, the `after-server` trigger is used.
     *
     * Adds a `after-server` trigger watcher to startup a socket.io server on
     * {@link Sencha.express.Server}.
     */
    static onMixedIn (cls) {
        cls.addWatcher('after-app', (app, instance) => {
            if (instance.socketIO && !instance.isExpressSSLServer) {
                instance.io = socketIO(app, instance.socketIO);
            }
        });

        cls.addWatcher('after-server', (server, instance) => {
            if (instance.socketIO) {
                instance.io = socketIO(server, instance.socketIO);
            }
        });
    }
}

module.exports = SocketIOable;
