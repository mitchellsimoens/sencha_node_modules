const {
    Mixin, event : {
        Listener
    }
} = require('../');

const events = require('events');

/**
 * @class Sencha.core.event.Observable
 * @extends Sencha.core.Mixin
 *
 * A mixin to mix into any {@link Sencha.core.Class} to allow that
 * class to fire and listen to events.
 *
 * Usage
 *      class Foo extends Bar {
 *          static get meta () {
 *              return {
 *                  mixins: [
 *                      '../Observable.js'
 *                  ]
 *              };
 *          }
 *
 *          stuff () {
 *              let event = this.fire({
 *                  type : 'beforestuff',
 *                  foo  : 42
 *              });
 *
 *              if (!event.cancel) {
 *                  moreStuff();
 *
 *                  this.fire({
 *                      type : 'stuff',
 *                      was  : 42
 *                  });
 *              }
 *          }
 *      }
 */
class Observable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isObservable
                 */
                isObservable : true

                /**
                 * @cfg {Object} listeners An object of listeners to apply
                 * onto this class.
                 */

                /**
                 * @private
                 * @property {EventEmitter} $emitter The native Node.js EventEmitter instance.
                 */
            }
        };
    }

    ctor (config) {
        const emitter = new events.EventEmitter();

        this.$emitter = emitter;

        // Node warns whenever we have more than 10 listeners
        emitter.setMaxListeners(0);

        if (config && config.listeners) {
            for (const event in config.listeners) {
                let options = config.listeners[ event ];

                if (typeof options === 'function') {
                    options = {
                        fn : options
                    };
                }

                this.on(event, options);
            }
        }
    }

    dtor () {
        const me = this;

        me.fire({
            me,
            type : 'destroy'
        });

        me.$emitter.removeAllListeners();
        me.$emitter = null;
    }

    /**
     * @param {Object/String} event The event to be fired. The event name
     * must be on the `type` property. If a string, will automatically
     * cast into an object placing it on the `type` property but no other
     * data for the event being fired will be sent.
     *
     * The event object that is passed to listeners have a `resolve` and
     * `reject` parameter that will resolve the promise that is returned.
     * It is optional to execute these methods and if multiple listeners
     * execute these methods could cause issues. TODO to capture these
     * executions and bundle them up to a single `resolve`/`reject` call.
     *
     * @return {Promise}
     */
    fire (event) {
        return new Promise((resolve, reject) => {
            if (typeof event === 'string') {
                event = {
                    type : event
                };
            }

            if (this.getListenerCount(event.type)) {
                if (!event.sender) {
                    event.sender = this;
                }

                Object.assign(event, {
                    reject,
                    resolve
                });

                this.$emitter.emit(event.type, event);
            } else {
                resolve();
            }
        });
    }

    /**
     * @param {String} event The event name to get the number of listeners on.
     */
    getListenerCount (event) {
        return this.$emitter.listenerCount(event);
    }

    /**
     * @param {Object/String} event Either the event name or an object to be passed
     * to {@link Sencha.core.event.Listener}.
     * @param {Function/String} fn The function to execute when the event has been executed.
     * If a String, must be a method on the scope.
     * @param {Mixed} scope The scope of the listener.
     */
    on (event, fn, scope) {
        const emitter = this.$emitter;
        let   options = event;

        if (typeof event === 'string') {
            if (typeof fn === 'object') {
                if (!scope) {
                    scope = fn.scope; // eslint-disable-line prefer-destructuring
                }

                fn = fn.fn; // eslint-disable-line prefer-destructuring
            }

            if (!scope) {
                emitter.on(event, fn);

                return null;
            }

            options = {
                scope
            };

            if (typeof fn === 'string') {
                fn = scope[ fn ]; // eslint-disable-line prefer-destructuring
            }

            options[ event ] = fn;
        }

        return new Listener(this, options);
    }

    /**
     * @param {String} event The event name to remove the listener from.
     * @param {Function} fn The function to remove.
     */
    un (event, fn) {
        if (!this.destroyed) {
            if (typeof event === 'object') {
                for (const key in event) {
                    this.un(key, event[ key ]);
                }
            } else {
                this.$emitter.removeListener(event, fn);
            }
        }
    }
}

module.exports = Observable;
