const Base = require('../Base');

/**
 * @class Sencha.core.operation.Operation
 * @extends Sencha.core.Base
 *
 * A base operation class to be used to abstract away operations from
 * classes that need to be more dynamic.
 */
class Operation extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isOperation
                 */
                isOperation : true
            }
        };
    }

    flatten (incoming, result = []) {
        if (Array.isArray(incoming)) {
            incoming.forEach((item) => {
                if (Array.isArray(item)) {
                    this.flatten(item, result);
                } else {
                    result.push(item);
                }
            });

            return result;
        }

        return incoming;
    }

    singularize (result) {
        if (Array.isArray(result)) {
            return result[ 0 ];
        }

        return result;
    }
}

module.exports = Operation;
