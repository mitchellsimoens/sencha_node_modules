const Combiner          = require('./Combiner');
const FrameworkCombiner = require('./Framework');
const PackageCombiner   = require('./Package');

/**
 * @class Sencha.fiddle.combiner.Fiddle
 * @extends Sencha.fiddle.combiner.Combiner
 *
 * Handles combining a fiddle's resources.
 */
class Fiddle extends Combiner {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleCombiner
                 */
                isFiddleCombiner : true
            }
        };
    }

    /**
     * Checks if the fiddle has loaded all it's resources. Will
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
                const { data : { fiddle } } = me;

                const { framework }     = fiddle;
                const frameworkCombiner = new FrameworkCombiner({
                    nightly : fiddle.frameworkVersion
                });
                const packageCombiner   = new PackageCombiner();

                fiddle.framework = frameworkCombiner.preCombine(framework.data);
                fiddle.packages  = packageCombiner  .preCombine(fiddle.packages); // eslint-disable-line no-whitespace-before-property

                deferred.resolve(fiddle);
            }

            me.destroy();
        }
    }
}

module.exports = Fiddle;
