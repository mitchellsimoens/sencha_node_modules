const { Base, Managerable } = require('@extjs/sencha-core');
const { Provider }          = require('./');

/**
 * @class Sencha.email.Manager
 * @singleton
 */
class Manager extends Base {
    static get meta () {
        return {
            mixins : [
                Managerable
            ],

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isEmailManager
                 */
                isEmailManager : true
            }
        };
    }

    static get baseInstance () {
        return {
            cls      : Provider,
            property : 'isEmailProvider'
        };
    }

    /**
     * @param {String/Sencha.email.Email} provider The provider to send the email with.
     * If a {@link Sencha.email.Email} instance is passed, the provider will be resolved
     * from the `provider` property on that instance.
     * @param {Sencha.email.Email} email The email instance to send with the
     * provider set on the email instance.
     * @return {Promise}
     */
    send (provider, email) {
        return new Promise((resolve, reject) => {
            if (provider) {
                if (provider.isEmail) {
                    email    = provider;
                    provider = email.provider; // eslint-disable-line prefer-destructuring
                }
            } else if (email) {
                provider = email.provider; // eslint-disable-line prefer-destructuring
            }

            // if falsy, this would return map of all providers
            if (provider) {
                provider = this.get(provider);
            }

            if (provider) {
                provider
                    .send(email)
                    .then(resolve, reject);
            } else {
                reject(new Error('Provider not found'));
            }
        });
    }
}

module.exports = new Manager();
