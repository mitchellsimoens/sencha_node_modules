const { Base }    = require('@extjs/sencha-core');
const { Manager } = require('./');

/**
 * @class Sencha.email.Email
 */
class Email extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isEmail
                 */
                isEmail : true

                /**
                 * @cfg {String/Sencha.email.Provider} provider
                 * The provider this email should be sent with.
                 * If a String, the {Sencha.email.Manager} will
                 * look the provider up assuming this is the
                 * provider's name.
                 */

                /**
                 * @cfg {Mixed} from The address to send from.
                 *
                 * The value of the from address depends on the
                 * provider the email will be sent with.
                 */

                /**
                 * @cfg {Mixed} to The address to send to.
                 *
                 * The value of the from address depends on the
                 * provider the email will be sent with.
                 */

                /**
                 * @cfg {String} subject The subject of the email.
                 */

                /**
                 * @cfg {String/Object} body The body of the email.
                 *
                 * If a String is provided, the body should be sent
                 * as HTML.
                 *
                 * If an Object is provided, the key can be either
                 * `text` or `html` which will allow the email to be
                 * sent with body bodies.
                 */
            }
        };
    }

    send (provider) {
        return Manager.send(provider, this);
    }
}

module.exports = Email;
