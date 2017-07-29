const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.Asset.update
 * @extends Sencha.core.Base
 *
 * A class to manage all UPDATE operations for fiddle assets.
 */
class Asset extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleAssetUpdater
                 */
                isFiddleAssetUpdater : true
            }
        };
    }

    update (data, frameworkid, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.name,
                data.code,
                data.type,
                data.password,
                data.autoBeautify,
                data.statusCode,
                data.remote,
                frameworkid,
                data.id
            ];
            const query   = new Query({
                inserts,
                sqls : `UPDATE fiddle_assets
SET
    name         = ?,
    code         = ?,
    type         = ?,
    password     = ?,
    autoBeautify = ?,
    statusCode   = ?,
    remote       = ?,
    extWrap      = (SELECT extWrap FROM fiddle_catalog WHERE id = ?)
WHERE id = ? AND @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Asset;
