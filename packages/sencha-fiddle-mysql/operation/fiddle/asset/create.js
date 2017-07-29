const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.Asset.create
 * @extends Sencha.core.Base
 *
 * A class to manage all CREATE operations for fiddle assets.
 */
class Asset extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleAssetCreator
                 */
                isFiddleAssetCreator : true
            }
        };
    }

    create (data, frameworkid, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.name,
                data.code,
                data.type,
                data.statusCode || 200,
                !!data.remote,
                frameworkid
            ];
            const query   = new Query({
                inserts,
                sqls : `INSERT INTO fiddle_assets
(fiddleid, name, code, type, statusCode, remote, extWrap)
SELECT @fiddleid, ?, ?, ?, ?, ?, fiddle_catalog.extWrap FROM fiddle_catalog WHERE id = ? AND @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Asset;
