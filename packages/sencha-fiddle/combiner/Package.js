const Combiner = require('./Combiner');

/**
 * @class Sencha.fiddle.combiner.Package
 * @extends Sencha.fiddle.combiner.Combiner
 *
 * Handles combining packages with it's assets.
 */
class Package extends Combiner {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isPackageCombiner
                 */
                isPackageCombiner : true
            }
        };
    }

    check () {
        const me = this;

        if (!me.count) {
            const { deferred } = me;

            if (me.hasError) {
                deferred.reject(me.hasError);
            } else {
                deferred.resolve(
                    me.preCombine(me.data.package)
                );
            }

            me.destroy();
        }
    }

    preCombine (packages, nightly = this.nightly) {
        const assets = packages.$assets;

        if (Array.isArray(assets)) {
            delete packages.$assets;

            assets.forEach(asset => {
                const pkg = packages.find(pkg => pkg.id === asset.packageid);

                if (pkg) {
                    if (nightly) {
                        asset.file = asset.file.replace('{date}', nightly);
                    }

                    if (pkg.assets) {
                        pkg.assets.push(asset);
                    } else {
                        pkg.assets = [ asset ];
                    }
                }
            });
        }

        return packages;
    }
}

module.exports = Package;
