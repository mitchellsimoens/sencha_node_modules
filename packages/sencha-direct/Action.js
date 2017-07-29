const { Base } = require('@extjs/sencha-core');

class Action extends Base {
    static get meta () {
        return {
            mixins : [
                '@extjs/sencha-core/Managerable'
            ],

            prototype : {
                /**
                 * @property {Boolean} isDirectAction
                 */
                isDirectAction : true,

                /**
                 * @cfg {Number} [len=0]
                 * The number of arguments expected when the action is called.
                 */

                serializeProps : [
                    'batched',
                    'formHandler',
                    'len',
                    'metadata',
                    'name',
                    'params',
                    'paramOrder',
                    'paramsAsHash',
                    'strict'
                ]
            }
        };
    }

    get serialize () {
        const ret = {};

        this.serializeProps.forEach((prop) => {
            if (this[ prop ] != null) {
                ret[ prop ] = this[ prop ];
            }
        });

        return ret;
    }

    handle () {
        throw new Error('Expected the `handle` method to be overridden.');
    }

    /**
     * @param {Array/Object} args The arguments to normalize. If an Object,
     * requires that {@link #params} or {@link #paramOrder} to be set.
     * @return {Array} An array of arguments parsed.
     */
    getArgs (args) {
        const { len } = this;

        // TODO should work with params, paramOrder, strict

        if (len == null) {
            args = [];
        } else {
            if (Array.isArray(args)) {
                args = args.slice(0, len);
            } else if (args == null) {
                args = [];
            } else {
                args = [ args ];
            }

            if (len > args.length) {
                throw new Error(`Expected ${len} argument${len === 1 ? '' : 's'}, got ${args.length} instead`);
            }
        }

        return args;
    }
}

module.exports = Action;
