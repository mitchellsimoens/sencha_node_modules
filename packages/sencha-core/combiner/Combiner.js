const { Base, Deferrable } = require('../');

/**
 * @class Sencha.core.combiner.Combiner
 * @extends Sencha.core.Base
 *
 * A base class for combiners.
 */
class Combiner extends Base {
    static get meta () {
        return {
            mixins : [
                Deferrable
            ],

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isCombiner
                 */
                isCombiner : true,

                /**
                 * The method to check if the combiner can be resolve.
                 * This normally checks the {@link count} property
                 * and resolves the {@link deferred} instance.
                 * @template
                 * @method
                 */
                check : this.identityFn, // eslint-disable-line sort-keys

                /**
                 * @property {Number} [count=0] The number of items
                 * added to wait for promise resolution.
                 */
                count : 0

                /**
                 * @property {Object} data The data the items apply onto.
                 */

                /**
                 * @property {Error} hasError If an item rejected, this property
                 * will hold the error from that rejection.
                 */
            }
        };
    }

    ctor () {
        const me = this;

        if (me.check !== me.identityFn) {
            me.check = me.createBuffered(me.check, 10, me);
        }

        if (!me.data) {
            me.data = {};
        }
    }

    dtor () {
        Object.assign(this, {
            check    : null,
            data     : null,
            hasError : null
        });
    }

    // TODO
    createBuffered (fn, buffer, me, args) { // eslint-disable-line consistent-this
        let timerId;

        return (...innerArgs) => {
            const callArgs = args  || innerArgs;

            if (!me) {
                me = this;
            }

            if (timerId) {
                clearTimeout(timerId);
            }

            timerId = setTimeout(() => {
                fn.call(me, ...callArgs);
            }, buffer);
        };
    }

    /**
     * Method to add an item and then apply it's data onto the {@link data}.
     * @param {String} key The key to apply the data onto. This can be dot notated
     * and will apply on the nested objects.
     * @param {Sencha.core.Deferred/Sencha.core.combiner.Combiner} The deferral instance or
     * Combiner to listen to resolution onto.
     * @return {Promise}
     */
    add (key, promise) {
        const me = this;

        ++me.count;

        if (promise.deferred) {
            promise = promise.deferred;
        }

        return promise
            .then(me.onData.bind(me, key), me.onError.bind(me, key))
            .then(me.check, me.check);
    }

    /**
     * Method that executes when an item successfully resolves.
     * @private
     * @param {String} key The key to apply the data onto. This can be dot notated
     * and will apply on the nested objects.
     * @param {Object} data The data to which apply onto the {@link data} object.
     */
    onData (key, data) {
        --this.count;

        this.setData(key.split('.'), this.data, data);
    }

    /**
     * Method that executes when an item rejects with an error. This will set the
     * error onto {@link hasError}.
     * @private
     * @param {String} key The key to apply the data onto. This can be dot notated
     * and will apply on the nested objects.
     * @param {Error} e The error object.
     */
    onError (key, error) {
        --this.count;

        this.hasError = error;
    }

    /**
     * The method that handles applying data.
     * @private
     * @param {Array} parts The key parts split by `.`.
     * @param {Object} root The root object to apply the data onto.
     * @param {Mixed} data The data that came when the item resolved.
     */
    setData (parts, root, data) {
        const key = parts.shift();

        if (key) {
            if (parts.length) {
                if (root[ key ]) {
                    root = root[ key ];
                } else {
                    root = {};

                    root[ key ] = root;
                }

                this.setData(parts, root, data);
            } else if (root[ key ]) {
                if (typeof root[ key ] === 'object' && typeof data === 'object') {
                    Object.assign(root[ key ], data);
                } else {
                    root[ key ] = data;
                }
            } else {
                root[ key ] = data;
            }
        }
    }
}

module.exports = Combiner;
