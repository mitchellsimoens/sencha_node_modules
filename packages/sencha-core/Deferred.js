/**
 * @class Sencha.core.Deferred
 *
 * A deferral to allow a promise to be resolved outside of the promise's
 * resolve function.
 */
class Deferred {
    constructor () {
        this.promise = new Promise((resolve, reject) => {
            this.reject  = reject;
            this.resolve = resolve;
        });
    }

    /**
     * @method then
     * @param {Function} resolve The function to execute on promise resolution.
     * @param {Function} reject The function to execute on promise rejection.
     */
    then (resolve, reject) {
        return this.promise.then(resolve, reject);
    }

    /**
     * @param {Function} reject The function to execute on promise rejection.
     */
    catch (reject) {
        return this.promise.catch(reject);
    }

    /**
     * @private
     * @property {Promise} promise The actual promise instance.
     */
    /**
     * @method reject
     * @param {Mixed} data The data to reject the promise with.
     */
    /**
     * @method resolve
     * @param {Mixed} data The data to resolve the promise with.
     */
}

module.exports = Deferred;
