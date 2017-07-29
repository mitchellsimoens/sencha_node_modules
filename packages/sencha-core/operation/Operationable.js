const Mixin = require('../Mixin');

/**
 * @class Sencha.core.operation.Operationable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add operation methods to a Manager.
 */
class Operationable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isOperationable
                 */
                isOperationable : true
            }
        };
    }

    /**
     * Retrieve an operation by name.
     * @param {String/Sencha.core.operation.Operation} name The name of the operation. Can also
     * pass the `Operation` itself.
     */
    getOperation (...args) {
        return this.adapter.getOperation(...args);
    }

    /**
     * Retrieve and instaniate an operation.
     * @param {String/Sencha.core.operation.Operation} operation The operation to instantiate.
     * @param {Object} config An option config object.
     * @return {Sencha.core.operation.Operation}
     */
    instantiateOperation (...args) {
        return this.adapter.instantiateOperation(...args);
    }
}

module.exports = Operationable;
