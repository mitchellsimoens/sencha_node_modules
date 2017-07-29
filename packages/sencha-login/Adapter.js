const { Base } = require('@extjs/sencha-core');

const path = require('path');

const nameRe = /\./g;

/**
 * @class Sencha.login.Adapter
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
                 * @property {Boolean} isLoginAdapter
                 */
                isLoginAdapter : true
            }
        };
    }

    /**
     * @readonly
     * @property {Object} operations The object holding the operations.
     */
    get operations () {
        return {
            'forum.get'  : null,
            'forum.save' : null,

            'sencha.get'  : null,
            'sencha.save' : null
        };
    }

    /**
     * Retrieve an operation by name.
     * @param {String/Sencha.login.Operation} name The name of the operation. Can also
     * pass the `Operation` itself.
     */
    getOperation (name) {
        const operation = name.isClass ? name : this.operations[ name ] || name;

        if (typeof operation === 'string') {
            return this.operations[ name ] = require(path.join(this.rootPath, 'operation', name.replace(nameRe, '/'))); // eslint-disable-line global-require
        }

        return operation;
    }

    /**
     * Retrieve and instaniate an operation.
     * @param {String/Sencha.login.Operation} operation The operation to instantiate.
     * @param {Object} config An option config object.
     * @return {Sencha.login.Operation}
     */
    instantiateOperation (operation, config) {
        const Operation = this.getOperation(operation);

        return new Operation(config);
    }
}

module.exports = Adapter;
