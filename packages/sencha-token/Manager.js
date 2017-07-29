const { Base, operation : { Operationable } } = require('@extjs/sencha-core');

class Manager extends Base {
    static get meta () {
        return {
            mixins : [
                Operationable
            ],

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} [isTokenManager=true]
                 */
                isTokenManager : true

                /**
                 * @property {Sencha.core.operation.Adapter} adapter The adapter
                 * that will be used for all CRUD operations.
                 */
            }
        };
    }
}

module.exports = new Manager();
