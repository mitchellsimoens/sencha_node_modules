const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.MockData.update
 * @extends Sencha.core.Base
 *
 * A class to manage all UPDATE operations for fiddle data assets.
 */
class MockData extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleMockDataUpdater
                 */
                isFiddleMockDataUpdater : true
            }
        };
    }

    update (data, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.data,
                data.type,
                data.url,
                data.statusCode || 200,
                data.delay,
                data.dynamic,
                !!data.formHandler,
                data.direct_args,
                data.direct_len,
                data.id
            ];
            const query   = new Query({
                inserts,
                sqls : `UPDATE fiddle_mockdata
SET
    data        = ?,
    type        = ?,
    url         = ?,
    statusCode  = ?,
    delay       = ?,
    dynamic     = ?,
    formHandler = ?,
    direct_args = ?,
    direct_len  = ?
WHERE id = ? AND @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = MockData;
