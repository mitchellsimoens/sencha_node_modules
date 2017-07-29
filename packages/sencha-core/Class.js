const merge = function (destination = {}, ...args) {
    for (let i = 0; i < args.length; i++) {
        const object = args[ i ];

        for (const key in object) {
            const value = object[ key ];

            if (
                value && // eslint-disable-line operator-linebreak
                typeof value === 'object' && // eslint-disable-line operator-linebreak
                !(value instanceof Date) && // eslint-disable-line operator-linebreak
                !(value instanceof Error) && // eslint-disable-line operator-linebreak
                !(value instanceof Class) && // eslint-disable-line no-use-before-define,operator-linebreak
                !(value instanceof Map) && // eslint-disable-line operator-linebreak
                !(value instanceof Set)
            ) {
                const sourceKey = destination[ key ];

                if (sourceKey) {
                    if (Array.isArray(sourceKey)) {
                        destination[ key ] = value.concat(sourceKey);
                    } else if (typeof sourceKey === 'string') {
                        destination[ key ] = value;
                    } else {
                        merge(sourceKey, value);
                    }
                } else if (Array.isArray(value)) {
                    destination[ key ] = [ ...value ];
                } else {
                    destination[ key ] = merge({}, value);
                }
            } else {
                destination[ key ] = value;
            }
        }
    }

    return destination;
};

/**
 * @class Sencha.core.Class
 *
 * The root level class.
 */
class Class {
    static merge (...args) {
        return merge.apply(this, args);
    }

    /**
     * @static
     * @param {String} name The name of the trigger to watch for.
     * @param {Function} watcher The function to execute when the trigger has been triggered.
     *
     * This is a good way for classes to hook into different parts of a class.
     */
    static addWatcher (name, watcher) {
        let { _watchers : watchers } = this;

        if (!watchers) {
            watchers = {};

            this._watchers = watchers;
        }

        let watcherArr = watchers[ name ]; // eslint-disable-line one-var

        if (!watcherArr) {
            watcherArr = [];

            watchers[ name ] = watcherArr;
        }

        watcherArr.push(watcher);
    }

    /**
     * @static
     * @param {String} name The name of the trigger to watch for.
     * @param {Function} watcher The function attached to the watcher.
     */
    static removeWatcher (name, watcher) {
        const { _watchers : watchers } = this;
        const watcherArr               = watchers[ name ];

        if (Array.isArray(watcherArr)) {
            const idx = watcherArr.indexOf(watcher);

            if (idx > -1) {
                watcherArr.splice(idx, 1);
            }

            if (!watcherArr.length) {
                delete watchers[ name ];
            }
        }
    }

    /**
     * @static
     * @param {String} name The name of the trigger to remove.
     */
    static removeWatchers (needle) {
        const { _watchers : watchers } = this;

        for (const name in watchers) {
            if (!needle || needle === name) {
                const watcherArr = watchers[ name ];

                watcherArr.forEach((watcher) => this.removeWatcher(name, watcher));
            }
        }
    }

    /**
     * @static
     * @param {String} name The name of the trigger to trigger the watchers.
     * @param {Mixed} data The data to be passed to the trigger watchers.
     */
    static triggerWatchers (name, data, instance) {
        const { _watchers : watchers } = this;

        if (watchers) {
            const watcherArr = watchers[ name ];

            if (watcherArr) {
                watcherArr.forEach((watcher) => {
                    let me = this;

                    if (!instance) {
                        instance = name;
                        name     = me;
                        me       = null; // eslint-disable-line consistent-this
                    }

                    if (data) {
                        watcher.call(me, data, instance, name, me);
                    } else {
                        watcher.call(me, instance, name, me);
                    }
                });
            }
        }
    }

    /**
     * @param {Object} config The configuration object to apply onto the instance.
     *
     * This shouldn't be overriden but instead subclasses should use the {@link #ctor} method.
     */
    constructor (config) {
        const me = this;

        if (me.self !== me.constructor && me.constructor.decorate) {
            me.constructor.decorate();
        }

        if (me.config) {
            config = merge({}, me.config, config);
        }

        me.triggerWatchers('before-constructor', config);

        me.initializing = true;

        if (config) {
            // TODO should have better means
            delete config.ctor;
            delete config.dtor;

            for (const cfg in config) {
                const applier = `apply${cfg.substr(0, 1).toUpperCase()}${cfg.substr(1)}`;

                if (me[ applier ]) {
                    config[ cfg ] = me[ applier ].call(me, config[ cfg ], me[ cfg ]);
                }
            }

            me.$config = config;

            Object.assign(this, config);
        }

        me.triggerWatchers('before-ctor', config);

        me.callChain('ctor', false, config);

        me.triggerWatchers('after-ctor');

        me.initializing = false;
        me.initialized  = true;

        me.triggerWatchers('after-constructor');
    }

    /**
     * Destroy this instance, allows for any cleanup that is needed.
     *
     * This shouldn't be overriden but instead subclasses should use teh {@link dtor} method.
     */
    destroy () {
        const me = this;

        me.triggerWatchers('before-destroy');

        Object.assign(me, {
            destroyed  : true,
            destroying : true
        });

        me.triggerWatchers('before-dtor');

        me.callChain('dtor', true);

        me.triggerWatchers('after-dtor');

        // TODO enable once instance triggers are working
        // me.removeWatchers();

        me.destroying = false;

        me.triggerWatchers('after-destroy');

        return null;
    }

    /**
     * @private
     * @param {String} method The method to call on an instance and it's superclasses.
     * @param {Boolean} reverse If `true`, will reverse the chain of methods.
     * @parma {Mixed} args Arguments to pass to each method execution. If an array, the `apply`
     * method on the function will be used. If not an array but of another type, the `call` method
     * is used. If no arguments provided, the `call` method will be used but not pass any arguments.
     *
     * TODO maybe move this to Base or ClassMixin since this depends on the ClassMixin's decorate method
     * to populate the classes array.
     */
    callChain (method, reverse, args) {
        const me        = this;
        const { self }  = me;
        const meta      = self && self.meta;
        const classes   = meta ? meta.classes : [];
        const noArgs    = args == null;
        const arrayArgs = !noArgs && args && args.length !== undefined && Array.isArray(args);

        let begin = 0,
            end   = classes.length,
            incr  = 1;

        if (reverse) {
            begin = end - 1;
            end   = -1;
            incr  = end;
        }

        for (; begin !== end; begin += incr) {
            const cls = classes[ begin ].prototype;

            if (Object.prototype.hasOwnProperty.call(cls, method)) {
                const fn = cls[ method ];

                if (noArgs) {
                    fn.call(me);
                } else if (arrayArgs) {
                    fn.call(me, ...args);
                } else {
                    fn.call(me, args);
                }
            }
        }
    }

    /**
     * @param {Object} config A config object to apply onto the instance.
     */
    reconfigure (config) {
        if (config) {
            Object.assign(this.$config, config);
            Object.assign(this,         config);
        }
    }

    /**
     * @param {String} name The name of the watcher to trigger.
     * @param {Mixed} data The data to pass to the watchers.
     */
    triggerWatchers (name, data) {
        this.constructor.triggerWatchers(name, data, this);
    }
}

/**
 * @property {Boolean} [isInstance=true]
 * @readonly
 */
Class.prototype.isInstance = true;

/**
 * @property {Function} emptyFn A reusable empty function.
 * @readonly
 */
/**
 * @property {Function} emptyFn A reusable empty function.
 * @readonly
 * @static
 */
Class.emptyFn           = () => {}; // eslint-disable-line no-empty-function
Class.prototype.emptyFn = Class.emptyFn;

/**
 * @property {Function} identity A reusable function that returns the first argument.
 * @readonly
 */
/**
 * @property {Function} identity A reusable function that returns the first argument.
 * @readonly
 * @static
 */
Class.identityFn = x => x;
Class.prototype.identityFn = Class.identityFn;

/**
 * @param {Boolean} isClass
 * @readonly
 * @static
 */
Class.isClass = true;

module.exports = Class;
