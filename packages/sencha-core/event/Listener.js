const listenerOptions = {
    buffer  : 1,
    delay   : 1,
    managed : 1,
    scope   : 1,
    single  : 1
};

/**
 * @class Sencha.core.event.Listener
 *
 * A listener class that listens to an event and will execute a function
 * when the event has been fired.
 */
class Listener {
    /**
     * @private
     * @property {Sencha.core.Class} owner The class the listener is being listened on.
     */
    /**
     * @private
     * @property {Object} options The listener options.
     */
    /**
     * @private
     * @property {Object} listenFns An object of functions where the key is the event name
     * and the value is the function.
     */

    /**
     * @param {Sencha.core.Class} observable The class the listener is being listened on.
     * @param {Object} options Any listener options.
     */
    constructor (observable, options) {
        this.owner     = observable;
        this.options   = options;
        this.listenFns = {};

        this.process('doAdd');
    }

    /**
     * Removes all attached listeners.
     */
    destroy () {
        this.process('doRemove');
    }

    /**
     * @param {String} method The method to call for each {@link #options}.
     * This will normally call the {@link #doAdd} or {@link #doRemove}
     * when this class is instantiated or destroyed.
     */
    process (method) {
        const me          = this;
        const { options } = me;

        for (const event in options) {
            if (!(event in listenerOptions)) {
                let fn           = options[ event ];
                const subOptions = typeof fn === 'object' ? fn : null;

                if (subOptions) {
                    fn = subOptions.fn; // eslint-disable-line prefer-destructuring
                }

                me[ method ](event, fn, options, subOptions);
            }
        }
    }

    /**
     * @protected
     * @param {string} event The event name.
     * @param {Function} fn The function to execute when the event is fired.
     * @param {Object} options The options for the listener being added.
     * This will normally be {@link #options}.
     * @param {Object} subOptions Another opportunity to configure this listener.
     */
    doAdd (event, fn, options = {}, subOptions) {
        const me = this;

        let {
                buffer,
                delay,
                scope,
                single
            }        = options,
            listenFn = fn;

        if (subOptions) {
            buffer  = 'buffer'  in subOptions ? subOptions.buffer  : buffer;
            delay   = 'delay'   in subOptions ? subOptions.delay   : delay;
            scope   = 'scope'   in subOptions ? subOptions.scope   : scope;
            single  = 'single'  in subOptions ? subOptions.single  : single;
        }

        if (scope) {
            if (typeof listenFn === 'string') {
                listenFn = scope[ listenFn ]; // eslint-disable-line prefer-destructuring
            }

            listenFn = listenFn.bind(scope);
        }

        if (delay != null) {
            listenFn = me.wrapDelay(listenFn, delay);
        } else if (buffer != null) {
            listenFn = me.wrapBuffer(listenFn, buffer);
        }

        if (single) {
            listenFn = me.wrapSingle(event, listenFn);
        }

        me.listenFns[ event ] = listenFn;

        me.owner.on(event, listenFn);
    }

    /**
     * @protected
     * @param {String} event The event name to remove listeners from.
     */
    doRemove (event) {
        const { listenFns } = this;
        const fn            = listenFns[ event ];

        if (fn) {
            listenFns[ event ] = null;

            this.owner.un(event, fn);
        }
    }

    /**
     * @param {Function} fn The function of the listener.
     * @param {Number} buffer The number of milliseconds to buffer calls.
     *
     * This methods creates a buffer which will buffer all calls into a single
     * call that are called within the number of milliseconds.
     */
    wrapBuffer (fn, buffer) {
        let args, id;

        // Don't use "() => {...}" here because that will capture arguments from this
        // outer context!
        return function (...innerArgs) {
            args = innerArgs.length ? innerArgs : null;

            if (id) {
                clearTimeout(id);
            }

            id = setTimeout(() => {
                const a = args;

                args = null;

                if (a) {
                    fn(...a);
                } else {
                    fn();
                }
            }, buffer);
        };
    }

    /**
     * @param {Function} fn The function of the listener.
     * @param {Number} delay The number of milliseconds to delay execution.
     *
     * This method creates a delayed execution of the listener's function.
     */
    wrapDelay (fn, delay) {
        // Don't use "() => {...}" here because that will capture arguments from this
        // outer context!
        return function (...args) {
            args = args.length ? args : null;

            setTimeout(() => {
                if (args) {
                    fn(...args);
                } else {
                    fn();
                }
            }, delay);
        };
    }

    /**
     * @param {String} event The event name.
     * @param {Function} fn The function of the listener.
     *
     * This method creates a single function where when called will automatically
     * remove the listener. Any subsequent event fire will not be listened by this listener.
     */
    wrapSingle (event, fn) {
        return (...args) => {
            this.doRemove(event);

            return fn(...args);
        };
    }
}

module.exports = Listener;
