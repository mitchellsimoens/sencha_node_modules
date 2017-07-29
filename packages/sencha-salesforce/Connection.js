const jsforce = require('jsforce');
const SOAP    = require('jsforce/lib/soap');

const { Base }     = require('@extjs/sencha-core');
const { Console }  = require('@extjs/sencha-debug');
const { Shutdown } = require('@extjs/sencha-node');
const debug        = Console.find('salesforce');

/**
 * @class Sencha.salesforce.Connection
 */
class Connection extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isSalesforceConnection
                 */
                isSalesforceConnection : true,

                /**
                 * @cfg {Boolean} autoStart `true` to automatically login.
                 */
                autoStart : true // eslint-disable-line sort-keys

                /**
                 * @cfg {String} endpointUrl
                 */

                /**
                 * @cfg {String} loginUrl The URL to specify as the login URL. Optional.
                 */

                /**
                 * @cfg {String} name The name of this connection.
                 */

                /**
                 * @cfg {String} password The Salesforce user's password.
                 *
                 * Also see {@link #token}.
                 */

                /**
                 * @cfg {String} username The Salesforce user's username.
                 */

                /**
                 * @cfg {String} token An optional Salesforce user security token.
                 */

                /**
                 * @cfg {String} xmlns The XML namespace for SOAP calls.
                 */

                /**
                 * @property {Error} connError
                 */

                /**
                 * @property {jsforce} jsforce The jsforce connection.
                 */

                /**
                 * @property {jsforce.lib.soap} soap The soap connection.
                 */
            }
        };
    }

    ctor () {
        if (this.autoStart) {
            this.start();
        }

        Shutdown.on(this.onShutdown = this.close.bind(this));
    }

    dtor () {
        Shutdown.un(this.onShutdown);

        delete this.onShutdown;

        this.close();
    }

    /**
     * Attempts to create the connection to Salesforce.
     * @return {Promise}
     */
    start () {
        return new Promise((resolve, reject) => {
            const { loginUrl, password, token } = this;
            const connection = new jsforce.Connection(loginUrl ? {
                loginUrl
            } : null);

            connection.login(
                this.username,
                password + (token ? token : ''),
                (error) => {
                    if (error) {
                        const message = error instanceof Error ? error.message : error;

                        this.connError = error;

                        debug.log('Salesforce failed to connect:', this.name);
                        debug.log('     ', 'error:', message);

                        Object.assign(this, {
                            force : null,
                            soap  : null
                        });

                        reject(this.connError);
                    } else {
                        this.force = connection;
                        this.soap  = new SOAP(
                            connection,
                            {
                                endpointUrl : this.endpointUrl,
                                xmlns       : this.xmlns
                            }
                        );

                        resolve();
                    }
                }
            );
        });
    }

    /**
     * Closes the connection to Salesforce. This will automatically be done
     * when the Node server shuts down.
     * @return {Promise}
     */
    close () {
        return new Promise((resolve) => {
            const { force } = this;

            if (force) {
                const onLogout = () => {
                    Object.assign(this, {
                        force : null,
                        soap  : null
                    });

                    debug.log('Salesforce connection shutdown:', this.name);

                    resolve();
                };

                force
                    .logout()
                    .then(onLogout, onLogout);
            } else {
                Object.assign(this, {
                    force : null,
                    soap  : null
                });

                resolve();
            }
        });
    }

    /**
     * @param {String} method The method to invoke against the {@link #soap} connection.
     * @param {Object} args An object of arguments to pass to the invocation.
     * @param {String} schema An optional schema to use.
     * @return {Promise}
     */
    invoke (method, args, schema) {
        return new Promise((resolve, reject) => {
            const { soap } = this;

            if (soap) {
                soap.invoke(
                    method,
                    args,
                    schema,
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('Soap connection not created'));
            }
        });
    }

    /**
     * @param {String} soql The Salesforce Object Query Language to
     * query with.
     * @return {Promise}
     */
    query (soql) {
        return new Promise((resolve, reject) => {
            const { force } = this;

            if (force) {
                force.query(
                    soql,
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                reject(new Error('jsforce connection not created'));
            }
        });
    }
}

module.exports = Connection;
