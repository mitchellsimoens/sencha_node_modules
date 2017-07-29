const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.framewrok.Asset.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for framework assets.
 */
class Asset extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFrameworkAssetGetter
                 */
                isFrameworkAssetGetter : true
            }
        };
    }

    /**
     * Retrieves framework assets for a particular framework.
     * @param {Number} id The framework id to retrieve assets for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getById (descriptor, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query();

            if (typeof descriptor === 'object') {
                const inserts = [];
                const wheres  = [];

                if (descriptor.framework) {
                    inserts.push(descriptor.framework);
                    wheres.push('fiddle_catalog.framework = ?');
                }

                if (descriptor.theme) {
                    inserts.push(descriptor.theme);
                    wheres.push('fiddle_catalog.theme = ?');
                }

                if (descriptor.toolkit) {
                    inserts.push(descriptor.toolkit);
                    wheres.push('fiddle_catalog.toolkit = ?');
                }

                if (descriptor.version) {
                    inserts.push(descriptor.version);
                    wheres.push(`LEFT(fiddle_catalog.version, ${descriptor.version.length}) = ?`);
                }

                query.inserts = inserts;
                query.sqls    = `SELECT
    fiddle_catalog_assets.*
FROM fiddle_catalog_assets
WHERE fiddle_catalog_assets.catalogid = (
    SELECT
        fiddle_catalog.id
    FROM fiddle_catalog
    WHERE ${wheres.join(' AND ')}
    ORDER BY LENGTH(fiddle_catalog.version) DESC, fiddle_catalog.version DESC
    LIMIT 1
);`;
            } else {
                query.inserts = [ descriptor ];
                query.sqls    = 'SELECT fiddle_catalog_assets.* FROM fiddle_catalog_assets WHERE fiddle_catalog_assets.catalogid = ?;';
            }

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Retrieves framework assets for a fiddle.
     * @param {Number} id The real fiddle id to retrieve assets for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : 'SELECT fiddle_catalog_assets.* FROM fiddle_catalog_assets INNER JOIN fiddle_catalog ON fiddle_catalog.id = fiddle_catalog_assets.catalogid INNER JOIN fiddles ON fiddles.id = ? AND fiddles.frameworkid = fiddle_catalog.id;'
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Asset;
