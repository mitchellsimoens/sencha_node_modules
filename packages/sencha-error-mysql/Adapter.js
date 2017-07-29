const { Adapter } = require('@extjs/sencha-error');
const path        = require('path');

/**
 * @class Sencha.error.mysql.Adapter
 * @extends Sencha.error.Adapter
 *
 * An adapter to hold MySQL operations.
 */
class MySQLAdapter extends Adapter {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isErrorMySQLAdapter
                 */
                isErrorMySQLAdapter : true,

                rootPath : path.join(__dirname, './')
            }
        };
    }
}

module.exports = MySQLAdapter;
