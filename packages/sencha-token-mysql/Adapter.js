const { operation : { Adapter } } = require('@extjs/sencha-core');

/**
 * @class Sencha.token.mysql.Adapter
 * @extends Sencha.core.operation.Adapter
 *
 * An adapter to hold MySQL operations.
 */
class MySQLAdapter extends Adapter {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} [isTokenMySQLAdapter=true]
                 */
                isTokenMySQLAdapter : true,

                rootPath : __dirname
            }
        };
    }

    get operations () {
        let operations = this._operations;

        if (!operations) {
            operations = {
                'api.key.get'      : null,
                'api.token.create' : null,
                'api.token.delete' : null,
                'api.token.get'    : null
            };

            this._operations = operations;
        }

        return operations;
    }

    instantiateOperation (operation, config = {}) {
        config.db = this.db;

        return super.instantiateOperation(operation, config);
    }
}

module.exports = MySQLAdapter;
