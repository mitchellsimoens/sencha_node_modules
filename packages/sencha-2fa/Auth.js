const { Base } = require('@extjs/sencha-core');

const QRCode    = require('qrcode');
const speakeasy = require('speakeasy');

class Auth extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isAuth
                 */
                isAuth : true,

                encoding : 'base32', // eslint-disable-line sort-keys

                issuer : 'Sencha'
            }
        };
    }

    /**
     * Generates a random secret and `otpauth_url`.
     *
     * @param {Object} config
     * @param {String} [config.encoding]
     * What encoding to use. Defaults to {@link #encoding}.
     * @param {Number} [config.length=20]
     * The length of secret to generate.
     * @return {Object} The secret object in 3 formats plus the
     * `otpauth_url`:
     *
     *     {
     *         ascii: '...',
     *         hex: '...',
     *         base32: '...',
     *         otpauth_url: 'otpauth://totp/SecretKey?secret=...'
     *     }
     */
    generateSecret ({
        encoding = this.encoding,
        length   = 20
    } = {}) {
        return this.secret = speakeasy.generateSecret({
            encoding,
            length
        });
    }

    /**
     * Generates an `otpauth://` url that allows a label and issuer that can
     * be used by Google Authenticator.
     *
     * @param {Object} config
     * @param {String} [config.encoding]
     * What encoding to use. Defaults to {@link #encoding}.
     * @param {String} [config.issuer]
     * The issuer of this secret usually the company name. Defaults to {@link #issuer}
     * @param {String} [config.label]
     * The label for the url usually a username or email. Defaults to {@link #label}
     * @param {String} [config.secret]
     * The secret saved to the database. Defaults to {@link #secret}.
     * @return {String} The url that can be used to create a QR Code.
     */
    getAuthenticatorUrl ({
        encoding = this.encoding,
        issuer   = this.issuer,
        label    = this.label,
        secret   = this.secret
    } = {}) {
        if (typeof secret === 'object') {
            secret = secret[ encoding ];
        }

        return speakeasy.otpauthURL({
            encoding,
            issuer,
            label,
            secret
        });
    }

    /**
     * Generates a QR Code image. This process is async so it returns
     * a promise that will reject with the error or resolve with the
     * data uri.
     *
     * @param {String} url The `otpauth_url` generated with the secret.
     * @return {Promise}
     */
    getQRCode (url) {
        return new Promise((resolve, reject) => {
            QRCode.toDataURL(
                url,
                (error, data) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                }
            );
        });
    }

    /**
     * Create the manual entry token. This would take place of
     * scanning the QR Code.
     *
     * @param {Object} config
     * @param {String} [config.encoding]
     * What encoding to use. Defaults to {@link #encoding}.
     * @param {String} [config.secret]
     * The secret saved to the database. Defaults to {@link #secret}.
     * @return {String}
     */
    getAuthToken ({
        encoding = this.encoding,
        secret   = this.secret
    } = {}) {
        if (typeof secret === 'object') {
            secret = secret[ encoding ];
        }

        return speakeasy.totp({
            encoding,
            secret
        });
    }

    /**
     * Validates a user token to determine trustworthiness.
     *
     * @param {Object} config
     * @param {String} [config.encoding]
     * What encoding to use. Defaults to {@link #encoding}.
     * @param {String} [config.secret]
     * The secret saved to the database. Defaults to {@link #secret}.
     * @param {String} config.token
     * The token the user typed in.
     * @return {Boolean}
     */
    validateToken ({
        token,
        encoding = this.encoding,
        secret   = this.secret
    }) {
        if (typeof secret === 'object') {
            secret = secret[ encoding ];
        }

        return speakeasy.totp.verify({
            encoding,
            secret,
            token
        });
    }
}

module.exports = Auth;
