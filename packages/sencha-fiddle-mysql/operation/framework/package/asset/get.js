const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.framework.package.asset.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for framework package assets.
 */
class Asset extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFrameworkPackageAssetGetter
                 */
                isFrameworkPackageAssetGetter : true
            }
        };
    }

    /**
     * Retreives assets for a framework's packages.
     * @param {Number} id The framework id to retrieve assets for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getForPackageById (descriptor, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query();

            if (typeof descriptor === 'object') {
                const catalogInserts = [];
                const catalogWheres  = [];
                const packageInserts = [];
                const packageWheres  = [
                    'fiddle_catalog_packages.id = fiddle_catalog_packages_assets.packageid'
                ];

                if (descriptor.framework) {
                    catalogInserts.push(descriptor.framework);
                    catalogWheres.push('fiddle_catalog.framework = ?');
                }

                if (descriptor.id) {
                    catalogInserts.push(descriptor.id);
                    catalogWheres.push('fiddle_catalog.id = ?');
                }

                if (descriptor.name) {
                    packageInserts.push(descriptor.name);
                    packageWheres.push('fiddle_catalog_packages.name = ?');
                }

                if (descriptor.theme) {
                    catalogInserts.push(descriptor.theme);
                    catalogWheres.push('fiddle_catalog.theme = ?');
                }

                if (descriptor.toolkit) {
                    catalogInserts.push(descriptor.toolkit);
                    catalogWheres.push('fiddle_catalog.toolkit = ?');
                }

                if (descriptor.version) {
                    catalogInserts.push(descriptor.version);
                    catalogWheres.push(`LEFT(fiddle_catalog.version, ${descriptor.version.length}) = ?`);
                }

                packageWheres.unshift(`fiddle_catalog_packages.catalogid = (
    SELECT
        fiddle_catalog.id
    FROM fiddle_catalog
    WHERE ${catalogWheres.join(' AND ')}
    ORDER BY LENGTH(fiddle_catalog.version) DESC, fiddle_catalog.version DESC
    LIMIT 1
)`);

                query.inserts = catalogInserts.concat(packageInserts);
                query.sqls    = `SELECT
    fiddle_catalog_packages_assets.*
FROM fiddle_catalog_packages_assets
INNER JOIN fiddle_catalog_packages ON ${packageWheres.join(' AND ')};`;
            } else {
                query.inserts = [ descriptor ];
                query.sqls    = `SELECT
    fiddle_catalog_packages_assets.*
FROM fiddle_catalog_packages_assets
INNER JOIN fiddle_catalog_packages ON fiddle_catalog_packages.catalogid = ? AND fiddle_catalog_packages.id = fiddle_catalog_packages_assets.packageid;`;
            }

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Retrieves assets for a fiddle's packages.
     * @param {Number} id The real fiddle id to retrieve assets for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getForPackageForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : `SELECT
    fiddle_catalog_packages_assets.*
FROM fiddles
INNER JOIN fiddle_packages ON fiddle_packages.fiddleid = fiddles.id
INNER JOIN fiddle_catalog_packages ON fiddle_catalog_packages.catalogid = fiddles.frameworkid AND fiddle_catalog_packages.id = fiddle_packages.packageid
INNER JOIN fiddle_catalog_packages_assets ON fiddle_catalog_packages_assets.packageid = fiddle_catalog_packages.id
WHERE fiddles.id = ?;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Asset;
