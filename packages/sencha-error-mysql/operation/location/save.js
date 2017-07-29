const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.error.mysql.operation.Location.get
 * @extends Sencha.core.Base
 *
 * A class to manage all SAVE operations for an error's location.
 */
class LocationSave extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isLocationSaver
                 */
                isLocationSaver : true
            }
        };
    }

    save (Error, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ this.$parse(Error) ],
                sqls    : `INSERT INTO app_error_location SET errorid = @error_id, ?;`
            });

            batch.add(query);

            query.then(resolve).catch(reject);
        });
    }

    $parse (Error) {
        const { location } = Error;

        return {
            hash     : location.hash,
            host     : location.host,
            href     : location.href,
            origin   : location.origin,
            pathname : location.pathname,
            port     : location.port,
            protocol : location.protocol,
            referer  : location.referer,
            search   : location.search
        };
    }
}

module.exports = LocationSave;
