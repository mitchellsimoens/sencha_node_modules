const { Base, Mixin } = require('./');

/**
 * @class Sencha.core.Managerable
 */
class Managerable extends Mixin {
    static get meta () {
        return {
            mixinId : 'managerable',

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isManagerable
                 */
                isManagerable : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Boolean} [autoDestroy=true] Automatically destroy instances
                     * when they are removed.
                     */
                    autoDestroy : true,

                    /**
                     * @cfg {String} [instanceProperyt=__$instances] Property to save
                     * instances (an Object) onto.
                     */
                    instancesProperty : '__$instances',

                    /**
                     * @cfg {String} [nameProperty=__$name] A property to save the name
                     * of the instance onto the instance.
                     */
                    nameProperty : '__$name'
                }
            }
        };
    }

    /**
     * @static
     * @property {Object} baseInstance An object defining a base class and property
     * to use when adding and getting instances.
     *
     * Defaults to:
     *
     *     {
     *         cls      : Base,
     *         property : 'isInstance'
     *     }
     *
     * The `cls` property should resolve to a class definition to be used when
     * a configuration object is passed to the {@link #add} method.
     * The `property` property is the property on the item to check to see if
     * it's an instance of the class.
     */
    static get baseInstance () {
        return {
            cls      : Base,
            property : 'isInstance'
        };
    }

    ctor () {
        const { instancesProperty } = this;

        if (!this[ instancesProperty ]) {
            this[ instancesProperty ] = new Map();
        }
    }

    dtor () {
        const { instancesProperty } = this;

        this.remove(true);

        this[ instancesProperty ] = null;
    }

    /**
     * @param {String/Object} name The name of the item to be added. This
     * can be an object of name to item pairs.
     * @param {Object/Base} item The {@link Base} instance or configuration object.
     */
    add (name, item, baseInfo = this.constructor.baseInstance) {
        const me = this;

        if (typeof name === 'object') {
            for (const key in name) {
                me.add(key, name[ key ], baseInfo);
            }
        } else {
            const {
                instancesProperty
            } = me;
            let   instances             = me[ instancesProperty ];

            if (!instances) {
                instances = new Map();

                me[ instancesProperty ] = instances;
            }

            const instance = instances.get(name);

            if (instance && !Array.isArray(instance)) {
                if (instance !== item) {
                    throw new Error(`Instance already exists: ${name}.`);
                }
            } else if (item && item.isInstance && (item.destroyed || item.destroying)) {
                throw new Error(`Instance is destroyed: ${name}.`);
            } else {
                if (item && item[ baseInfo.property ]) {
                    item[ me.nameProperty ] = name;
                } else {
                    if (item) {
                        item[ me.nameProperty ] = name;
                    } else {
                        item = {
                            [ me.nameProperty ] : name
                        };
                    }

                    item.nameProperty = me.nameProperty;

                    item = new baseInfo.cls(item); // eslint-disable-line new-cap
                }

                if (baseInfo.beArray) {
                    if (Array.isArray(instance)) {
                        instance.push(item);
                    } else {
                        instances.set(name, [ item ]);
                    }
                } else {
                    instances.set(name, item);
                }
            }
        }
    }

    /**
     * @param {String/Base} name The name or item to retrieve.
     *
     * This method can accept a name which will lookup the instance from the {@link #instances}
     * object. If this is a {@link Base} instance, the instance will be returned.
     * This allows other methods to accept either type of parameter. If no name is passed,
     * all instances will be returned.
     */
    get (name) {
        const { instancesProperty } = this;
        const instances             = this[ instancesProperty ];

        if (name) {
            const {
                constructor : {
                    baseInstance : {
                        property
                    }
                }
            } = this;

            if (name[ property ]) {
                return name;
            } else if (typeof name === 'string') {
                return instances.get(name);
            }

            return name;
        } else {
            return instances;
        }
    }

    /**
     * @param {String/Base} item The item to remove. If a String, will be looked up
     * assuming it's the items's name. If no item is provided, all items will be removed.
     * If a Boolean is passed, all items will be removed and the value will be used for the
     * destroy argument.
     * @param {Boolean} [destroy=this.autoDestroy] If `true` or {@link #autoDestroy} is `true`,
     * will destroy the item being removed.
     */
    remove (item, destroy = this.autoDestroy) {
        const me        = this;
        const instances = me[ me.instancesProperty ];

        if (typeof item === 'boolean') {
            destroy = item;
            item    = null;
        }

        if (item) {
            const { nameProperty } = me;
            const {
                constructor : {
                    baseInstance : {
                        beArray
                    }
                }
            } = me;

            item = me.get(item);

            if (item) {
                if (beArray) {
                    const arr = instances.get(item[ nameProperty ]);

                    if (arr) {
                        const idx = arr.indexOf(item);

                        arr.splice(idx, 1);

                        if (!arr.length) {
                            instances.delete(item[ nameProperty ]);
                        }
                    }
                } else {
                    instances.delete(item[ nameProperty ]);
                }

                delete item[ nameProperty ];

                if (item && destroy) {
                    if (Array.isArray(item)) {
                        item.forEach(item => item.destroy.bind(item));
                    } else {
                        item.destroy();
                    }
                }
            }
        } else {
            instances.forEach((item) => me.remove(item, destroy));
        }
    }
}

module.exports = Managerable;
