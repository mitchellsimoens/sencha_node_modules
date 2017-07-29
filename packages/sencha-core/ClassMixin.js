const ignoreKeys = {
    ctor : 1,
    dtor : 1
};

const privateKeys = {
    meta      : 1,
    mixins    : 1,
    prototype : 1,
    self      : 1
};

/**
 * @class Sencha.core.ClassMixin
 *
 * A function to apply onto classes to enable functionality like the {@link Sencha.core.Class#meta}
 * functionality.
 *
 * Example useage:
 *
 *     const Bar        = require('./Bar');
 *     const ClassMixin = require('sencha-core/ClassMixin');
 *
 *     class Foo extends ClassMixin(Bar) {}
 */
const ClassMixin = function (parent) {
    let nextId = 1;

    function getAllKeys (obj, stop) {
        const keys = [];
        const map  = {};

        for (; obj && obj !== stop; obj = Object.getPrototypeOf(obj)) {
            const names = Object.getOwnPropertyNames(obj);

            for (let i = 0; i < names.length; ++i) {
                const key = names[ i ];

                if (!ignoreKeys[ key ] && !map[ key ]) {
                    map[ key ] = true;

                    keys.push(key);
                }
            }
        }

        return keys;
    }

    function copyIf (dest, src, keys) {
        if (keys) {
            for (let i = 0; i < keys.length; ++i) {
                const k = keys[ i ];

                if (!(k in dest)) {
                    const descriptor = Object.getOwnPropertyDescriptor(src, k);

                    if (descriptor) {
                        Object.defineProperty(dest, k, descriptor);
                    } else {
                        dest[ k ] = src[ k ];
                    }
                } else if (!privateKeys[ k ]) {
                    const descriptor = Object.getOwnPropertyDescriptor(dest, k);

                    if (!descriptor || (descriptor.writable || descriptor.set)) {
                        if (Array.isArray(src[ k ])) {
                            dest[ k ] = dest[ k ].concat(src[ k ]);
                        } else if (typeof src[ k ] === 'object') {
                            dest[ k ] = (dest.self ? dest.self : dest).merge({}, src[ k ], dest[ k ]);
                        }
                    }
                }
            }
        } else {
            for (const k in src) {
                if (!(k in dest)) {
                    const descriptor = Object.getOwnPropertyDescriptor(src, k);

                    if (descriptor) {
                        Object.defineProperty(dest, k, descriptor);
                    } else {
                        dest[ k ] = src[ k ];
                    }
                }
            }
        }
    }

    function processMixins (T) {
        const { meta, prototype } = T;

        const {
            classes,
            classMap,
            mixins,
            mixinMap,
            staticMixinMap
        } = meta;

        for (let index = 0; index < mixins.length; ++index) {
            let mixin = mixins[ index ];

            if (typeof mixin === 'string') {
                mixin = require(mixin); // eslint-disable-line global-require

                mixins[ index ] = mixin;
            }

            if (!Object.prototype.isPrototypeOf.call(parent, mixin)) {
                throw new Error(`Mixin class must extend Base - ${mixin.name}`);
            }

            // Make sure each mixin has been decorated before we try to include it.
            if (mixin.prototype.self !== mixin) {
                mixin.decorate();
            }

            const { meta : mixinMeta } = mixin;

            // If the mixin is not already in the list of classes[] (if it is, then all of
            // its bases and mixins are as well):
            if (!classMap[ mixinMeta.id ]) {
                const mixinClasses = mixinMeta.classes;

                // We process the "classes" of the mixin to properly fill out this class's
                // classes[] in topo order. We also fill out the maps by mixinId for any
                // mixins that we may be gaining (perhaps having been mixed in to these
                // mixins).
                for (let i = 0; i < mixinClasses.length; ++i) {
                    const cls                = mixinClasses[ i ];
                    const { meta : clsMeta } = cls;

                    // Since the mixin has been decorated, we know all entries in its
                    // classes[] have as well. Some of these may already be in our classes[]
                    // but some may not.
                    if (!classMap[ clsMeta.id ]) {
                        classMap[ clsMeta.id ] = cls;
                        classes.push(cls);

                        // Classes designed to be used as mixins can specify a "mixinId" in
                        // their meta block. This id is used to populate a map that classes
                        // can use to target the mixin and its prototype directly:
                        //
                        //      this.mixins.foo.method();  // "foo" is a mixinId
                        //
                        const id = clsMeta.mixinId;

                        if (id && !mixinMap[ id ]) {
                            mixinMap[ id ]       = cls.prototype;
                            staticMixinMap[ id ] = cls;
                        }
                    }
                }

                // We cannot use for(in) loop here because class methods are not
                // enumerable.
                const proto = mixin.prototype;
                let   keys  = getAllKeys(proto, parent.prototype);

                copyIf(prototype, proto, keys);

                keys = getAllKeys(mixin, parent);
                copyIf(T, mixin, keys);

                if (mixin.onMixedIn) {
                    mixin.onMixedIn.call(mixin, T);
                }
            }
        }
    }

    return class extends parent {
        /**
         * @member Sencha.core.Class
         * @static
         * @property {Object} meta An object of meta data to be applied to the class when decorated.
         *
         * Current properties that are handled are:
         *
         *     static get meta () {
         *         return {
         *             //mixes a class into this class
         *             mixins : [
         *                 'sencha-core/event/observable
         *             ],
         *
         *             //adds these properties onto this class. ES2015 cannot have non-function members but ocming in ES.next
         *             prototype : {
         *                 foo : 'bar'
         *             }
         *         };
         *     }
         */
        static get meta () {
            return null;
        }

        /**
         * @member Sencha.core.Class
         * @static
         * @param {Object} meta The meta data to decorate the class with. If not
         * provided, will use the {@link Sencha.core.Class#meta} property.
         */
        static decorate (meta) {
            const me             = this;
            const { prototype } = me;

            const classMap       = {};
            const mixinMap       = {};
            const staticMixinMap = {};

            let beginMixins = 0,
                endMixins   = 0,
                superclass = null,
                classes, superClasses; // eslint-disable-line sort-vars

            if (prototype.self === me) {
                return me;
            }

            prototype.self = me;

            if (me === parent) {
                classes = [];
            } else {
                superclass = Object.getPrototypeOf(me);

                if (!Object.prototype.hasOwnProperty.call(superclass.prototype, 'self') && superclass.decorate) {
                    superclass.decorate();
                }

                const superMeta = superclass.meta;

                if (superMeta) {
                    classes = (superClasses = superMeta.classes).slice();

                    Object.assign(classMap,       superMeta.classMap);
                    Object.assign(mixinMap,       superMeta.mixinMap);
                    Object.assign(staticMixinMap, superMeta.staticMixinMap);
                } else {
                    classes = [];
                }
            }

            if (meta === undefined) {
                // If the user did not pass the class meta object, check for a static "meta"
                // property defined on the class itself.
                meta = me.meta; // eslint-disable-line prefer-destructuring

                // Since class constructors in ES6 are prototype chained, the "meta" we find
                // may be coming from a decorated base class. We reject this case by checking
                // for the "class" property which is not provided by the user but is stamped
                // on the object we place on the constructor.
                if (meta && meta.class) {
                    meta = null;
                }
            }

            prototype.mixins = mixinMap;
            me.mixins         = staticMixinMap;

            const finalMeta = {
                class : me,
                classMap,
                classes,
                id    : nextId++,
                mixinMap,
                staticMixinMap,
                superclass
            };

            // Replaced the "meta" property on the class. We have to use defineProperty() to
            // replace a "static get meta () {}" declaration.
            Object.defineProperty(me, 'meta', {
                value : finalMeta
            });

            if (meta) {
                for (const name in meta) {
                    if (!(name in finalMeta)) {
                        finalMeta[ name ] = meta[ name ];
                    }
                }

                let properties = meta.prototype;

                if (properties) {
                    delete finalMeta.prototype;

                    if (properties.config && superclass.prototype.config) {
                        properties.config = superclass.merge({}, superclass.prototype.config, properties.config);
                    }

                    Object.assign(prototype, properties);
                }

                properties = meta.statics;

                if (properties) {
                    delete finalMeta.statics;
                    Object.assign(me, properties);
                }

                if (finalMeta.mixins) {
                    // Capture the number of classes before mixing anything.
                    beginMixins = classes.length;

                    processMixins(me);

                    // And now that we have done the mixins, the delta represents the
                    // mixins we just mixed in.
                    endMixins = classes.length;
                }
            }

            // The class itself is the final member of the classes/classMap.
            classMap[ finalMeta.id ] = me;
            classes.push(me);

            if (superClasses) {
                // Any classes in our superclass' classes list should be informed of the
                // extension. These will be our true base classes as well as any mixins.
                // Since mixins have already been informed of the mixed in status when they
                // were mixed in to our base, it is appropriate to inform them of this new
                // derived class as well.
                for (let i = 0, n = superClasses.length; i < n; ++i) {
                    const c  = superClasses[ i ];
                    const fn = c.meta.extended || c.onExtended;

                    if (fn) {
                        fn.call(c, me);
                    }
                }
            }

            for (let i = beginMixins; i < endMixins; ++i) {
                const c  = classes[ i ];
                const fn = c.meta.mixed;

                if (fn) {
                    fn.call(c, me);
                }
            }

            return me;
        }
    };
};

module.exports = ClassMixin;
