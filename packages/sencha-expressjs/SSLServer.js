const { Config } = require('@extjs/sencha-core');

const Server = require('./Server');

const fs    = require('fs');
const https = require('https');
const path  = require('path');

/**
 * @class Sencha.express.SSLServer
 * @extends Sencha.express.Server
 *
 * A class to create a secure express server on.
 *
 * For non-secure servers, please use {@link Sencha.express.Server}.
 */
class SSLServer extends Server {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isExpressSSLServer
                 */
                isExpressSSLServer : true

                /**
                 * @cfg {Object} certificates An object of key-value pairs
                 * where the key is the type of certificate and the value is
                 * either the actual certificate or a string that will be read
                 * off the filesystem.
                 * Each certificate should be relative to the `appRoot` config
                 * or `process.cwd()`.
                 */
            }
        };
    }

    get certificates () {
        return this._certificates;
    }

    set certificates (certificates) {
        for (const key in certificates) {
            if (typeof certificates[ key ] === 'string') {
                certificates[ key ] = fs.readFileSync(certificates[ key ]);
            }
        }

        this._certificates = certificates;
    }

    applyCertificates (certificates) {
        if (certificates) {
            const { appRoot } = Config;

            if (appRoot) {
                for (const type in certificates) {
                    certificates[ type ] = path.join(appRoot, certificates[ type ]);
                }
            }
        }

        return certificates;
    }

    $createServer (app) {
        const { certificates } = this;

        if (!certificates || !certificates.key || !certificates.cert) {
            throw new Error('No certificates were provided to create a secure server with');
        }

        return https.Server(certificates, app); // eslint-disable-line new-cap
    }
}

module.exports = SSLServer;
