const { Batch } = require('@extjs/sencha-mysql');

const Base            = require('./Base');
const Manager         = require('./Manager');
const PackageCombiner = require('./combiner/Package');

class Package extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isPackage
                 */
                isPackage : true
            }
        };
    }

    static loadByNames (info) {
        return new Promise((resolve, reject) => {
            const { names } = info;

            if (Array.isArray(names) && names.length) {
                const {
                    batch = new Batch(),
                    connection
                } = info;

                let { framework } = info;

                const pkg    = Manager.instantiateOperation('framework.package.get');
                const assets = Manager.instantiateOperation('framework.package.asset.get');

                if (typeof framework === 'number') {
                    framework = {
                        id : framework
                    };
                }

                Promise
                    .all(
                        names.map(name => {
                            const packageCombiner = new PackageCombiner({
                                nightly : info.nightly
                            });
                            const descriptor      = Object.assign(
                                {
                                    name
                                },
                                framework
                            );

                            packageCombiner.add('package',         pkg   .getForFrameworkById(descriptor, batch)); // eslint-disable-line no-whitespace-before-property
                            packageCombiner.add('package.$assets', assets.getForPackageById  (descriptor, batch)); // eslint-disable-line func-call-spacing

                            return packageCombiner;
                        })
                    )
                    /**
                     * since we use Promise.all, packages comes back as:
                     *
                     *     [
                     *         [
                     *             {...}
                     *         ],
                     *         [
                     *             {...}
                     *         ]
                     *     ]
                     *
                     * so we need to flatten it a bit
                     */
                    .then(packages => packages.map(pkg => pkg[ 0 ]))
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                resolve();
            }
        });
    }
}

module.exports = Package;
