const { combiner : { Combiner : Base } } = require('@extjs/sencha-core');

/**
 * @class Sencha.login.combiner.Combiner
 * @extends Sencha.core.combiner.Combiner
 *
 * Handles combining a user's resources.
 */
class Combiner extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isLoginCombiner
                 */
                isLoginCombiner : true
            }
        };
    }

    /**
     * Checks if the user has loaded all it's resources.
     * Will automatically destroy this combiner when all resources
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

module.exports = Combiner;
