const Base = require('../Base');

const path = require('path');

const nameRe = /\./g;

/**
 * @class Sencha.core.operation.Adapter
 * @extends Sencha.core.Base
 *
 * A base adapter class to abstract away retrieving operations
 * for subclass adapters.
 */
class Adapter extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isAdapter
                 */
                isAdapter : true

                /**
                 * @cfg {String} rootPath The path to the root where the operations are kept.
                 */

                /**
                 * @cfg {Object} operationConfig An optional config object to pass when instantiating
                 * an operation.
                 */
            }
        };
    }

    /**
     * @readonly
     * @property {Object} operations The object holding the operations. Meant to be overridden in a subclass.
     */
    get operations () {
        return {};
    }

    /**
     * Retrieve an operation by name.
     * @param {String/Sencha.core.operation.Operation} name The name of the operation. Can also
     * pass the `Operation` itself.
     * @return {Sencha.core.operation.Operation} The operation class.
     */
    getOperation (name) {
        let operation = name && name.isClass && name.prototype.isOperation ? name : this.operations[ name ];

        if (!operation || typeof operation === 'string') {
            operation = require(path.join(this.rootPath, 'operation', name.replace(nameRe, '/'))); // eslint-disable-line global-require

            this.operations[ name ] = operation;
        }

        return operation;
    }

    /**
     * Retrieve and instaniate an operation.
     * @param {String/Sencha.core.operation.Operation} operation The operation to instantiate.
     * @param {Object} config An option config object.
     * @return {Sencha.core.operation.Operation} The operation instance.
     */
    instantiateOperation (operation, config) {
        const Operation = this.getOperation(operation);

        return new Operation(
            Object.assign(
                {},
                this.operationConfig,
                config
            )
        );
    }
}

module.exports = Adapter;
