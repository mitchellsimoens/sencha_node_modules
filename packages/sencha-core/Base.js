const { Class, ClassMixin } = require('./');

const instantiators = {};

function createInstantiator (numArgs) {
    let args = '';

    for (let i = 0; i < numArgs; ++i) {
        args += `${i ? ',' : ''}args[${i}]`;
    }

    return new Function('T,args', `return new T(${args});`);
}

/**
 * @class Sencha.core.Base
 * @extends Sencha.core.Class
 *
 * A base class that provides life-cycle management, mixins and other features to derived
 * classes.
 *
 * ## Life-Cycle
 * The `Base` class defines a standard initialization and destruction sequence based on
 * two template methods: `ctor` and `dtor`. The initialization sequence is invoked by the
 * `Base` constructor and the destruction by the `destroy` method.
 *
 * This approach to life-cycle methods is designed to support simple inheritance as well
 * as mixins. That is, it ensures that the `ctor` methods for classes and mixins are always
 * called during construction and always in the correct, "top-down" order (from base to
 * derived). Similarly, the `destroy` method ensures that all `dtor` methods are called
 * for base classes and mixins. These are called in the reverse order to deconstruct the
 * object. Finally, in the presence of mixins, the `ctor` and `dtor` methods are called
 * only once for any given mixin or base class, even if these classes occur in the dreaded
 * "diamond" of inheritance.
 *
 * In general, derived classes then do not implement `constructor` or `destroy` methods.
 * For example:
 *
 *      class Foo extends Base {
 *          ctor () {
 *              console.log('Foo ctor');
 *          }
 *
 *          dtor () {
 *              console.log('Foo dtor');
 *          }
 *      }
 *
 *      class Bar extends Foo {
 *          ctor () {
 *              console.log('Bar ctor');
 *          }
 *
 *          dtor () {
 *              console.log('Bar dtor');
 *          }
 *      }
 *
 *      let obj = new Bar();
 *
 *      > Foo ctor
 *      > Bar ctor
 *
 *      obj.destroy();
 *
 *      > Bar dtor
 *      > Foo dtor
 *
 * ## Mixins
 * When a class implements a useful interface yet cannot be used as the base (typically
 * because another base must be used), a mixin allows a class to gain much of the same
 * benefit as inheritance.
 *
 * To provide this ability, `Base` uses a static class property called `meta`. The value
 * of this property is an object describing various aspects of the derived class (such as
 * mixins).
 *
 *      class Mixin extends Base {
 *          ctor () {
 *              console.log('Mixin ctor');
 *          }
 *
 *          dtor () {
 *              console.log('Mixin dtor');
 *          }
 *      }
 *
 *      class Jazz extends Bar {
 *          // This is the static "meta" property. This will be replaced by the
 *          // processed "meta" object when the class is first used.
 *          //
 *          static get meta () {
 *              return {
 *                  mixins: [
 *                      Mixin  // can be a constructor
 *
 *                      // or require()-able string w/default export of a constructor
 *                  ]
 *              };
 *          }
 *
 *          ctor () {
 *              console.log('Jazz ctor');
 *          }
 *
 *          dtor () {
 *              console.log('Jazz dtor');
 *          }
 *      }
 *
 *      let obj = new Jazz();
 *
 *      > Foo ctor
 *      > Bar ctor
 *      > Mixin ctor
 *      > Jazz ctor
 *
 *      obj.destroy();
 *
 *      > Jazz dtor
 *      > Mixin dtor
 *      > Bar dtor
 *      > Foo dtor
 *
 * ## The Meta Object
 * The `meta` object property is a (static) class property. If defined, the `meta`
 * object can have any of the following properties that will be recognized and processed
 * by `Base`. Once process, the property is replaced by the "final" meta object. This
 * object will have some properties replaced with more processed forms, but all other
 * properties will remain.
 *
 * ### mixinId
 * An id to use to identify a class when it is mixed in to other classes.
 *
 *      class Stuff extends Base {
 *          static get meta () {
 *              return {
 *                  mixinId: 'stuff'
 *              };
 *          }
 *
 *          method () {
 *          }
 *
 *          static staticMethod () {
 *          }
 *      }
 *
 *      class Thing extends Jazz {
 *          static get meta () {
 *              return {
 *                  mixins: [
 *                      Stuff
 *                  ]
 *              };
 *          }
 *
 *          method () {
 *              console.log('Jazz method');
 *
 *              this.mixins.stuff.method.call(this);
 *          }
 *
 *          static staticMethod () {
 *              console.log('Jazz staticMethod');
 *
 *              this.mixins.stuff.staticMethod.call(this);
 *          }
 *      }
 *
 *      let obj = new Thing();
 *
 *      obj.method();
 *
 *      Thing.staticMethod();
 *
 *
 * ### prototype
 * An object to be copied onto the class prototype.
 *
 * ### extended
 * A callback invoked when the class is extended. TODO NOT IMPLEMENTED
 *
 * ### mixed
 * A callback invoked when the class is mixed in to another class. TODO NOT IMPLEMENTED
 *
 * ### Futures
 * The following features of the Ext JS class system are potentially useful and could
 * be added in the future:
 *
 *  * alias (perhaps via a Factoryable base or mixin; timing will be an issue)
 *  * config (perhaps like Ext JS or perhaps with "Config" objects)
 *  * abstract
 *
 * ## Class Processing
 * Classes are processed "just in time". This can occur as late as the creation of the
 * first instance of the class. It will also happen when a class is mixed into another
 * class and that class is processed. Should it be necessary, a class can be processed
 * explicitly.
 *
 * For example:
 *
 *      class Stuff extends Base {
 *          static get meta () {
 *              return {
 *                  mixinId: 'stuff'
 *              };
 *          }
 *
 *          method () {
 *          }
 *
 *          static staticMethod () {
 *          }
 *      }
 *
 *      Stuff.decorate();  // decorate the Stuff class based on its "meta" data
 *
 * ## Non-Features
 * The following Ext JS class system features do not translate across and are not on
 * the list of future pieces to implement:
 *
 *  * extend              (provided by the class keyword)
 *  * private             (not critical and likely not needed)
 *  * requires            (use module system)
 *  * uses                (use module system)
 *  * override            (might be needed but would be very different)
 *  * alternateClassName  (class names are n/a)
 *  * statics             (provided by static keyword)
 *  * inheritableStatics  (all statics are inheritable)
 */
class Base extends ClassMixin(Class) { // eslint-disable-line new-cap
    /**
     * @static
     * @protected
     * @param {Sencha.core.Class} T The class definition to create an instance of.
     * @param {Array} args The arguments to be passed into the contructor.
     */
    static construct (T, args) {
        const n            = args ? args.length : 0;
        const instantiator = instantiators[ n ] || (instantiators[ n ] = createInstantiator(n));

        return instantiator(T, args);
    }

    /**
     * @static
     * @param {Array} args An option array of arguments. If not provided,
     * the arguments when executing this create method will be used.
     *
     * Simple method to execute the {@link #construct} static method passing in this class.
     *
     *     SomeClass.create('foo', 'bar');
     */
    static create (...args) {
        return Base.construct(this, args);
    }
}

/**
 * @param {Boolean} isBase
 * @readonly
 * @static
 */
Base.isBase = true;

module.exports = Base;
