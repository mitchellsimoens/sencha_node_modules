const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.error.Manager
 * @extends Sencha.core.Base
 * @singleton
 *
 * A manager class that can be an entry point to retrieve operations
 * from the configured adapter.
 */
class Manager extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isErrorManager
                 */
                isErrorManager : true

                /**
                 * @property {Sencha.error.Adapter} adapter The adapter
                 * that will be used for all CRUD operations.
                 */
            }
        };
    }

    /**
     * Retrieve an operation by name.
     * @param {String/Sencha.error.Operation} name The name of the operation. Can also
     * pass the `Operation` itself.
     */
    getOperation (operation) {
        return this.adapter.getOperation(operation);
    }

    /**
     * Retrieve and instaniate an operation.
     * @param {String/Sencha.error.Operation} operation The operation to instantiate.
     * @param {Object} config An option config object.
     * @return {Sencha.error.Operation}
     */
    instantiateOperation (operation, config) {
        return this.adapter.instantiateOperation(operation, config);
    }
}

module.exports = new Manager();
