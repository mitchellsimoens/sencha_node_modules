const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.Package.update
 * @extends Sencha.core.Base
 *
 * A class to manage all UPDATE operations for fiddle packages.
 */
class Package extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddlePackageUpdater
                 */
                isFiddlePackageUpdater : true
            }
        };
    }

    update (data, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.fiddleid,
                data.packageid,
                data.id
            ];
            const query   = new Query({
                inserts,
                sqls : `UPDATE fiddle_packages
SET
    fiddleid  = ?,
    packageid = ?
WHERE id = ? AND @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Package;
