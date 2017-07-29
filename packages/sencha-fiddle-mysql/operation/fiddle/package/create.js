const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.fiddle.Package.create
 * @extends Sencha.core.Base
 *
 * A class to manage all CREATE operations for fiddle packages.
 */
class Package extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddlePackageCreator
                 */
                isFiddlePackageCreator : true
            }
        };
    }

    create (data, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ data.packageid ],
                sqls    : `INSERT INTO fiddle_packages
                    (fiddleid, packageid)
                    SELECT @fiddleid, ? FROM (SELECT 1) temp WHERE @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Package;
