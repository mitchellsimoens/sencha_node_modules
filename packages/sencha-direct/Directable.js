const { Base }    = require('@extjs/sencha-core');
const { Manager } = require('./');

/**
 * @class Sencha.direct.Directable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the ability to add {@link Sencha.direct.Provider} instances
 * to {@link Sencha.direct.Manager} on any class.
 */
class Directable extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @property {Boolean} isDirectable
                 * @readonly
                 */
                isDirectable : true

                /**
                 * @cfg {Object/Sencha.direct.Provider} direct
                 * The configuration to set to {@link Sencha.direct.Manager}.
                 */
            }
        };
    }

    get direct () {
        return Manager.get();
    }

    set direct (direct) {
        if (direct) {
            Object.assign(Manager, direct);
        }
    }
}

module.exports = Directable;
