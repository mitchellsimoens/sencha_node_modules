const { Deferred, Mixin } = require('./');

const bindFns = [
    'catch',
    'reject',
    'resolve',
    'then'
];

/**
 * @class Sencha.core.Deferrable
 */
class Deferrable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isDeferrable
                 */
                isDeferrable : true

                /**
                 * @cfg {Sencha.core.Deferred} deferred A Deferred instance
                 * to allow resolution outwide of a Promise. When
                 * a query has returned from the mysql server,
                 * this will be resolves/rejected.
                 */
            }
        };
    }

    ctor () {
        if (!this.deferred) {
            this.deferred = new Deferred();
        }

        bindFns.forEach(fn => this[ fn ] = this[ fn ].bind(this));
    }

    dtor () {
        this.deferred = null;
    }

    /**
     * @property {Promise} promise The promise instance that will be resolved/rejected on
     * the database query completion.
     */
    get promise () {
        return this.deferred.promise;
    }

    /**
     * Resolves the {@link deferred} instance. If an `onResolve` method exists, the results
     * will be passed to the method.
     * @param {Array/Object} results The results of the sql statements. This will
     * exeucte the {@link #deferred}'s {@link Sencha.core.Deferred#resolve} method.
     */
    resolve (results) {
        this.deferred.resolve(results);

        if (this.onResolve) {
            this.onResolve(results);
        }
    }

    /**
     * Rejects the {@link deferred} instance. If an `onReject` method exists, the error
     * will be passed to the method.
     * @param {String/Error} error The error of any of the sql statements. This will
     * exeucte the {@link #deferred}'s {@link Sencha.core.Deferred#reject} method.
     */
    reject (error) {
        if (!(error instanceof Error)) {
            error = new Error(error);
        }

        this.deferred.reject(error);

        if (this.onReject) {
            this.onReject(error);
        }
    }

    /**
     * @param {Function} resolve The function to execute on promise resolution.
     * @param {Function} reject The function to execute on promise rejection.
     */
    then (resolve, reject) {
        return this.deferred.then(resolve, reject);
    }

    /**
     * @param {Function} reject The function to execute on promise rejection.
     */
    catch (reject) {
        return this.deferred.catch(reject);
    }
}

module.exports = Deferrable;
