const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

function onLoad (result) {
    if (Array.isArray(result)) {
        return result[ 0 ];
    }

    return result;
}

/**
 * @class Sencha.fiddle.mysql.operation.Fiddle.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for fiddle assets.
 */
class Fiddle extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleGetter
                 */
                isFiddleGetter : true
            }
        };
    }

    /**
     * Retrieves the fiddle information.
     * @param {Number} id The real fiddle id to retrieve.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getById (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : 'SELECT * FROM fiddles WHERE id = ? LIMIT 1;'
            });

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }
}

module.exports = Fiddle;
