const { combiner : { Combiner } } = require('@extjs/sencha-core');

/**
 * @class Sencha.error.combiner.Error
 * @extends Sencha.core.combiner.Combiner
 *
 * Handles combining a error's resources.
 */
class Error extends Combiner {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isErrorCombiner
                 */
                isErrorCombiner : true
            }
        };
    }

    /**
     * Checks if the error has loaded all it's resources. Will
     * automatically destroy this combiner when all resources
     * have been loaded.
     */
    check () {
        const me = this;

        if (!me.count) {
            const { deferred } = me;

            if (me.hasError) {
                deferred.reject(me.hasError);
            } else {
                deferred.resolve(me.data);
            }

            me.destroy();
        }
    }
}

module.exports = Error;
