const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.Asset.delete
 * @extends Sencha.core.Base
 *
 * A class to manage all DELETE operations for fiddle assets.
 */
class Asset extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleAssetDeleter
                 */
                isFiddleAssetDeleter : true
            }
        };
    }

    delete (data, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.id
            ];
            const query = new Query({
                inserts,
                sqls : `DELETE FROM fiddle_assets WHERE id = ? AND @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Asset;
