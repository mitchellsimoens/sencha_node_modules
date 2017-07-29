const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.framework.Package.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for framework packages.
 */
class Package extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFrameworkPackageGetter
                 */
                isFrameworkPackageGetter : true
            }
        };
    }

    /**
     * Retrieves all framework packages for a particular framework.
     * @param {Number} id The framework id to retrieve packages for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getForFrameworkById (descriptor, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query();

            if (typeof descriptor === 'object') {
                const catalogInserts = [];
                const catalogWheres  = [];
                const packageInserts = [];
                const packageWheres  = [];

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
    fiddle_catalog_packages.*
FROM fiddle_catalog_packages
WHERE ${packageWheres.join(' AND ')};`;
            } else {
                query.inserts = [ descriptor ];
                query.sqls    = `SELECT
    fiddle_catalog_packages.*
FROM fiddle_catalog_packages
WHERE fiddle_catalog_packages.name = ?;`;
            }

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Retrieves framework packages for a fiddle. This gets all the packages
     * for the framework attached to a fiddle.
     * @param {Number} id The real fiddle id to retrieve packages for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getForFrameworkForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : `SELECT
    fiddle_catalog_packages.*
FROM fiddle_catalog_packages
INNER JOIN fiddles ON fiddles.id = ? AND fiddles.frameworkid = fiddle_catalog_packages.catalogid;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Retrieves framework packages attached to a fiddle.
     * @param {Number} id The real fiddle id to retrieve packages for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : `SELECT
                        fiddle_catalog_packages.*
                    FROM fiddles
                    INNER JOIN fiddle_packages ON fiddle_packages.fiddleid = fiddles.id
                    INNER JOIN fiddle_catalog ON fiddle_catalog.id = fiddles.frameworkid
                    INNER JOIN fiddle_catalog_packages ON fiddle_catalog_packages.id = fiddle_packages.packageid AND fiddle_catalog_packages.catalogid = fiddle_catalog.id
                    WHERE fiddles.id = ?;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Package;
