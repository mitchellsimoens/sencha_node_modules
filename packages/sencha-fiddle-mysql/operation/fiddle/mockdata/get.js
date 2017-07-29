const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

function onLoad (result) {
    if (Array.isArray(result)) {
        return result[ 0 ];
    }

    return result;
}

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.MockData.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for fiddle data assets.
 */
class MockData extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleMockDataGetter
                 */
                isFiddleMockDataGetter : true
            }
        };
    }

    /**
     * Retrieves all mock data assets for a fiddle.
     * @param {Number} id The real fiddle id to retrieve the data assets for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getAllForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : 'SELECT fiddle_mockdata.* FROM fiddle_mockdata WHERE fiddle_mockdata.fiddleid = ?;'
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Retrieves a single mock data for a fiddle.
     * @param {Number} id The real fiddle id to the retrieve mock data for.
     * @param {String} name The name (path) of the file to retrieve.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getOneForFiddle (id, name, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id, name ],
                sqls    : 'SELECT fiddle_mockdata.* FROM fiddle_mockdata WHERE fiddle_mockdata.fiddleid = ? AND fiddle_mockdata.url = ?;'
            });

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }

    /**
     * Retrieves all direct mock data for a session.
     * @param {String} id The session id to retrieve the direct mock data form.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getAllDirectForSession (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : 'SELECT fiddle_assets_temp.* FROM fiddle_assets_temp WHERE fiddle_assets_temp.type = "direct" AND fiddle_assets_temp.sessionid = ?;'
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Retrieves all direct mock data for a fiddle.
     * @param {String} id The fiddle id to retrieve the direct mock data form.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getAllDirectForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : 'SELECT fiddle_mockdata.* FROM fiddle_mockdata WHERE fiddle_mockdata.type = "direct" AND fiddle_mockdata.fiddleid = ?;'
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = MockData;
