const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.email.Provider
 *
 * This is a base provider class and shouldn't be used
 * directly but subclassed.
 */
class Provider extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isEmailProvider
                 */
                isEmailProvider : true
            }
        };
    }

    /**
     * @param {Sencha.email.Email} email The email instance to
     * send with.
     */
    send () {
        // expected to be overridden
        throw new Error('Abstract provider cannot send emails');
    }
}

module.exports = Provider;
