const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.Package.delete
 * @extends Sencha.core.Base
 *
 * A class to manage all DELETE operations for fiddle packages.
 */
class Package extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddlePackageDeleter
                 */
                isFiddlePackageDeleter : true
            }
        };
    }

    delete (data, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ data.id ],
                sqls    : `DELETE FROM fiddle_packages WHERE id = ? AND @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Package;
