const {
    Base
} = require('./');

/**
 * @class Sencha.core.Mixin
 * @extends Sencha.core.Base
 *
 * An abstract/base mixin class.
 */
class Mixin extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isMixin
                 */
                isMixin : true
            }
        };
    }
}

module.exports = Mixin;
