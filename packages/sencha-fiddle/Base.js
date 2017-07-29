const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.fiddle.Base
 * @extends Sencha.core.Base
 *
 * A base class to hold common methods for the `Sencha.fiddle.*` classes.
 */
class FiddleBase extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleBase
                 */
                isFiddleBase : true
            }
        };
    }

    /**
     * Decode an id into a real fiddle id.
     * @static
     * @method
     * @param {String/Number} id The id to decode. If is a number,
     * is assumed the id is already decoded.
     */
    static decodeId (id) {
        return typeof id === 'string' ? parseInt(id, 32) : id;
    }

    /**
     * Encode the real fiddle id into one to provide to the client.
     * @static
     * @method
     * @param {Number/String} id The id to encode. If is a string,
     * is assumed the id is already encoded.
     */
    static encodeId (id) {
        return typeof id === 'string' ? id : id.toString(32);
    }
}

module.exports = FiddleBase;
