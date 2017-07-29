const { Adapter } = require('@extjs/sencha-login');

/**
 * @class Sencha.login.mysql.Adapter
 * @extends Sencha.login.Adapter
 *
 * An adapter to hold MySQL operations.
 */
class MySQLAdapter extends Adapter {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isLoginMySQLAdapter
                 */
                isLoginMySQLAdapter : true,

                rootPath : __dirname
            }
        };
    }
}

module.exports = MySQLAdapter;
