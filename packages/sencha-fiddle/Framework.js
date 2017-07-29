const { Batch } = require('@extjs/sencha-mysql');

const Base              = require('./Base');
const FrameworkCombiner = require('./combiner/Framework');
const Manager           = require('./Manager');

/**
 * @class Sencha.fiddle.Framework
 * @extends Sencha.fiddle.Base
 *
 * A class that can load the framework resources.
 */
class Framework extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFramework
                 */
                isFramework : true
            }
        };
    }

    /**
     * @static
     * @method
     * @param {Object} info
     * @param {Number} info.id The framework id to load the associated framework.
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    static load (info) {
        return new Promise((resolve, reject) => {
            // TODO support the object from the docs

            if (info.id) {
                const {
                    batch = new Batch(),
                    connection,
                    id
                } = info;

                const frameworkCombiner     = new FrameworkCombiner({
                    nightly : info.nightly
                });
                const framework             = Manager.instantiateOperation('framework.get');
                const frameworkAsset        = Manager.instantiateOperation('framework.asset.get');
                const frameworkPackage      = Manager.instantiateOperation('framework.package.get');
                const frameworkPackageAsset = Manager.instantiateOperation('framework.package.asset.get');

                frameworkCombiner.add('framework',                  framework            .getById            (id, batch)); // eslint-disable-line no-whitespace-before-property,func-call-spacing
                frameworkCombiner.add('framework.assets',           frameworkAsset       .getById            (id, batch)); // eslint-disable-line no-whitespace-before-property,func-call-spacing
                frameworkCombiner.add('framework.packages',         frameworkPackage     .getForFrameworkById(id, batch)); // eslint-disable-line no-whitespace-before-property
                frameworkCombiner.add('framework.packages.$assets', frameworkPackageAsset.getForPackageById  (id, batch)); // eslint-disable-line func-call-spacing

                frameworkCombiner
                    .then(data => new this({
                        data
                    }))
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('No `id` to load.'));
            }
        });
    }

    /**
     * @static
     * @method
     * @param {Object} info
     * @param {Number} info.id The real fiddle id to load the associated framework.
     * @param {Sencha.mysql.Batch} info.batch Optional. The batch to use to
     * add the separate database queries to. If one is not provided, one will
     * automatically be instantiated.
     * @param {Sencha.mysql.Connection} info.connection Optional. The database
     * connection to use to retrieve the data. If not provided, will not execute
     * the queries.
     * @return {Promise}
     */
    static loadForFiddle (info) {
        return new Promise((resolve, reject) => {
            if (info.id) {
                const {
                    batch = new Batch(),
                    connection,
                    id
                } = info;

                const frameworkCombiner     = new FrameworkCombiner({
                    nightly : info.nightly
                });
                const framework             = Manager.instantiateOperation('framework.get');
                const frameworkAsset        = Manager.instantiateOperation('framework.asset.get');
                const frameworkPackage      = Manager.instantiateOperation('framework.package.get');
                const frameworkPackageAsset = Manager.instantiateOperation('framework.package.asset.get');

                frameworkCombiner.add('framework',                  framework            .getForFiddle            (id, batch)); // eslint-disable-line no-whitespace-before-property,func-call-spacing
                frameworkCombiner.add('framework.assets',           frameworkAsset       .getForFiddle            (id, batch)); // eslint-disable-line no-whitespace-before-property,func-call-spacing
                frameworkCombiner.add('framework.packages',         frameworkPackage     .getForFrameworkForFiddle(id, batch)); // eslint-disable-line no-whitespace-before-property
                frameworkCombiner.add('framework.packages.$assets', frameworkPackageAsset.getForPackageForFiddle  (id, batch)); // eslint-disable-line func-call-spacing

                frameworkCombiner
                    .then(data => new this({
                        data
                    }))
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('No `id` to load.'));
            }
        });
    }
}

module.exports = Framework;
