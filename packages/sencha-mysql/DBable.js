const { Mixin }   = require('@extjs/sencha-core');
const { Manager } = require('./');

/**
 * @class Sencha.mysql.DBable
 * @extends Sencha.core.Mixin
 *
 * A mixin to add the ability to add {@link Sencha.mysql.Provider} instances
 * to {@link Sencha.mysql.Manager} on any class.
 */
class DBable extends Mixin {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isDBable
                 */
                isDBable : true

                /**
                 * @cfg {Object/Sencha.direct.Provider} direct The provider to add to this
                 * class. If an object, will create a {@link Sencha.direct.Provider} instance.
                 */
            }
        };
    }

    get db () {
        return Manager.get();
    }

    set db (db) {
        if (db) {
            Manager.add(db);
        }
    }
}

module.exports = DBable;
