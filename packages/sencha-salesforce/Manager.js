const { Base, Managerable } = require('@extjs/sencha-core');

const { Connection } = require('./');

const trueRe = /true|on/i;

/**
 * @class Sencha.salesforce.Manager
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
                 * @property {Boolean} isSalesforce
                 */
                isSalesforce : true
            }
        };
    }

    static get baseInstance () {
        return {
            cls      : Connection,
            property : 'isSalesforceConnection'
        };
    }

    /**
     * @param {String/Sencha.salesforce.Connection} connection The connection to invoke the call.
     * @param {String} method The method to invoke against the {@link #soap} connection.
     * @param {Object} args An object of arguments to pass to the invocation.
     * @param {String} schema An optional schema to use.
     * @return {Promise}
     */
    invoke (connection, method, args, schema) {
        return this
            .handleNoConnection(connection)
            .then(connection => connection.invoke(method, args, schema));
    }

    /**
     * @param {String/Sencha.salesforce.Connection} connection The connection to query.
     * @param {String} soql The Salesforce Object Query Language to
     * query with.
     * @return {Promise}
     */
    query (connection, soql) {
        return this
            .handleNoConnection(connection)
            .then(connection => connection.query(soql));
    }

    /**
     * @param {String/Sencha.salesforce.Connection} connection The connection
     * to check for. If a connection is attached, the promise is resolve. Else
     * the promise is rejected.
     * @return {Promise}
     */
    handleNoConnection (connection) {
        return new Promise((resolve, reject) => {
            connection = this.get(connection);

            if (connection) {
                resolve(connection);
            } else {
                reject(new Error('No jsforce connection object'));
            }
        });
    }

    /**
     * @param {Mixed} value The value to check if it is a nil object.
     * @return {Boolean}
     */
    isNil (value) {
        let nil = true;

        if (value && (!value.$ || !this.isTrue(value.$[ 'xsi:nil' ]))) {
            nil = false;
        }

        return nil;
    }

    /**
     * @param {Mixed} value The value to check if it is true. This will check
     * if the value is equal to `'true'` or `'on'`.
     * @return {Boolean}
     */
    isTrue (value) {
        return !this.isNil(value) && value && (typeof value !== 'string' || !!value.match(trueRe));
    }
}

module.exports = new Manager();
