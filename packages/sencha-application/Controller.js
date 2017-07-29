const {
    Base, event : {
        Observable
    }
} = require('@extjs/sencha-core');

/**
 * @class Sencha.application.Controller
 * @extends Sencha.core.Base
 *
 * A controller class to handle business logic. Currently doesn't do anything.
 *
 * Has {@link Sencha.core.event.Observable} mixin mixed in to allow listening
 * and firing events.
 */
class Controller extends Base {
    static get meta () {
        return {
            mixins : [
                Observable
            ],

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isController
                 */
                isController : true
            }
        };
    }
}

module.exports = Controller;
