const Combiner        = require('./Combiner');
const PackageCombiner = require('./Package');

/**
 * @class Sencha.fiddle.combiner.Framework
 * @extends Sencha.fiddle.combiner.Combiner
 *
 * Handles combining all of a framework's resources.
 */
class Framework extends Combiner {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleCombiner
                 */
                isFrameworkCombiner : true
            }
        };
    }

    /**
     * Checks if the framework has loaded all it's resources. Will
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
                deferred.resolve(
                    me.preCombine(me.data.framework)
                );
            }

            me.destroy();
        }
    }

    /**
     * Parses the data returned. Packages need to have their assets
     * applied onto them and not separately.
     */
    preCombine (framework, nightly = this.nightly) {
        const { assets }      = framework;
        const packageCombiner = new PackageCombiner({
            nightly
        });

        if (nightly && Array.isArray(assets) && assets.length) {
            assets.forEach(asset => {
                asset.file = asset.file.replace('{date}', nightly);
            });
        }

        framework.packages = packageCombiner.preCombine(framework.packages, nightly);

        return framework;
    }
}

module.exports = Framework;
