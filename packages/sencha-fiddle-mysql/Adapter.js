const { Adapter } = require('@extjs/sencha-fiddle');

/**
 * @class Sencha.fiddle.mysql.Adapter
 * @extends Sencha.fiddle.Adapter
 *
 * An adapter to hold MySQL operations.
 */
class MySQLAdapter extends Adapter {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleMySQLAdapter
                 */
                isFiddleMySQLAdapter : true,

                rootPath : __dirname
            }
        };
    }
}

module.exports = MySQLAdapter;
