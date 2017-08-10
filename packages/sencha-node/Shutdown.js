const { Base }    = require('@extjs/sencha-core');
const { Console } = require('@extjs/sencha-debug');
const debug       = Console.find('shutdown');

/**
 * @class Sencha.node.Shutdown
 * @extends Sencha.core.Base
 * @singleton
 *
 * A class that listens for process events to signify
 * the Node.js server is shutting down and can notify
 * attached callbacks.
 */

class Shutdown extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isNodeShutdown
                 */
                isNodeShutdown : true,

                /**
                 * @property {Array} callbacks The array of attached
                 * callbacks. When a shutdown is detected, the callbacks
                 * will be executed. Each callback may return a promise
                 * to delay the Node.js process from quitting.
                 */

                /**
                 * @property {Array} events The array of events that will be
                 * listened to on the process.
                 */
                events : [ // eslint-disable-line sort-keys
                    'SIGINT',
                    'SIGTERM',
                    'SIGHUP'
                ]
            }
        };
    }

    ctor () {
        this.callbacks = [];

        this.exec = this.exec.bind(this);
    }

    dtor () {
        this.deInit();
    }

    /**
     * @param {Function} callback The callback to execute when a shutdown is detected.
     */
    on (callback) {
        const { callbacks } = this;

        callbacks.push(callback);

        this.init();
    }

    /**
     * @param {Function} callback The callback to remove.
     */
    un (callback) {
        const { callbacks } = this;

        if (callbacks.length) {
            const idx = callbacks.indexOf(callback);

            if (idx > -1) {
                callbacks.splice(idx, 1);
            }
        }

        if (!callbacks.length) {
            this.deInit();
        }
    }

    /**
     * Initialize the listeners onto the process to detect a shutdown.
     */
    init () {
        const me = this;

        if (!me.eventsInitialized) {
            me.events.forEach(event => process.addListener(event, me.exec));

            me.eventsInitialized = true;
        }
    }

    /**
     * Removes the listeners from the process.
     */
    deInit () {
        const me = this;

        if (me.eventsInitialized) {
            me.events.forEach(event => process.removeListener(event, me.exec));

            me.eventsInitialized = false;
        }
    }

    /**
     * @private
     * @param {Boolean} preventExit If `true`, will not exit the Node process.
     * This is more for testing purposes.
     *
     * The method that will be executed when a shutdown is detected that will
     * loop through the attached callbacks and execute each.
     */
    exec (preventExit) {
        const doExit = preventExit !== true;

        doExit && debug.log('\n*** Sencha Shutting Down...\n');

        Promise
            .all(this.callbacks.map(callback => callback()))
            .then(() => {
                if (doExit) {
                    debug.log('\n*** Sencha Shut Down');

                    process.exit(0);
                }
            });
    }
}

module.exports = new Shutdown();
