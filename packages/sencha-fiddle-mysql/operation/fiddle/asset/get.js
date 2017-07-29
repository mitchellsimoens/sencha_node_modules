const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

function onLoad (result) {
    if (Array.isArray(result)) {
        [ result ] = result;
    }

    if (result) {
        return result;
    }

    throw new Error('File not found');
}

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.Asset.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for fiddle assets.
 */
class Asset extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleAssetGetter
                 */
                isFiddleAssetGetter : true
            }
        };
    }

    /**
     * Retrieves all assets for a fiddle.
     * @param {Number} id The real fiddle id to retrieve assets for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getAllForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : 'SELECT fiddle_assets.* FROM fiddle_assets WHERE fiddle_assets.fiddleid = ?;'
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Retrieves a single asset for a fiddle.
     * @param {Number} id The real fiddle id to the retrieve asset for.
     * @param {String} name The name (path) of the file to retrieve.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getOneForFiddle (id, name, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id, name ],
                sqls    : 'SELECT fiddle_assets.* FROM fiddle_assets WHERE fiddle_assets.fiddleid = ? AND fiddle_assets.name = ? LIMIT 1;'
            });

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }

    /**
     * Retrieves a single asset for a session.
     * @param {Number} id The session id to retrieve the asset for.
     * @param {String} name The name (path) of the file to retrieve.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getOneFromSession (id, name, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id, name ],
                sqls    : 'SELECT fiddle_assets_temp.* FROM fiddle_assets_temp WHERE fiddle_assets_temp.sessionid = ? AND fiddle_assets_temp.url = ?;'
            });

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }
}

module.exports = Asset;
