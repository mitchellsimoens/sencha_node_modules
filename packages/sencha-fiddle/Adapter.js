const { Base } = require('@extjs/sencha-core');

const path = require('path');

const nameRe = /\./g;

/**
 * @class Sencha.fiddle.Adapter
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
                 * @property {Boolean} isFiddleManager
                 */
                isFiddleAdapter : true
            }
        };
    }

    /**
     * @readonly
     * @property {Object} operations The object holding the operations.
     */
    get operations () {
        return {
            'fiddle.asset.get'    : null,
            'fiddle.create'       : null,
            'fiddle.get'          : null,
            'fiddle.mockdata.get' : null,
            'fiddle.update'       : null,

            'framework.asset.get'         : null,
            'framework.get'               : null,
            'framework.package.asset.get' : null,
            'framework.package.get'       : null
        };
    }

    /**
     * Retrieve an operation by name.
     * @param {String/Sencha.fiddle.Operation} name The name of the operation. Can also
     * pass the `Operation` itself.
     */
    getOperation (name) {
        // TODO use property once sencha-fiddle has an abstract operation class
        let operation = typeof name === 'string' ? this.operations[ name ] : name;

        if (!operation || typeof operation === 'string') {
            if (!operation) {
                operation = name;
            }

            operation = require(path.join(this.rootPath, 'operation', name.replace(nameRe, '/'))); // eslint-disable-line global-require

            this.operations[ name ] = operation;
        }

        return operation;
    }

    /**
     * Retrieve and instaniate an operation.
     * @param {String/Sencha.fiddle.Operation} operation The operation to instantiate.
     * @param {Object} config An option config object.
     * @return {Sencha.fiddle.Operation}
     */
    instantiateOperation (operation, config) {
        const Operation = this.getOperation(operation);

        return new Operation(config);
    }
}

module.exports = Adapter;
