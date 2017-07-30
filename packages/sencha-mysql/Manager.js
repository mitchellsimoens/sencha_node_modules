const { Base, Managerable } = require('@extjs/sencha-core');

const { Connection } = require('./');

/**
 * @class Sencha.mysql.Manager
 * @extends Sencha.core.Base
 * @singleton
 *
 * A manager class to manage all things MySQL from
 * querying the connection to suspending a connection.
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
                 * @property {Boolean} isMySQLManager
                 */
                isMySQLManager : true
            }
        };
    }

    static get baseInstance () {
        return {
            cls      : Connection,
            property : 'isMySQLConnection'
        };
    }

    get logger () {
        return this._logger || console;
    }

    set logger (logger) {
        this._logger = logger;
    }

    /**
     * @param {String/String[]} sql The sql(s) to log to the console.
     * @param {Array} inserts The insert parameters to apply onto the sql statements.
     */
    debug (sql, inserts) {
        const { logger } = this;

        logger.log(' ');
        logger.log(' == MYSQL QUERY DEBUG ==');

        if (!inserts || !inserts.length) {
            if (Array.isArray(sql)) {
                sql = sql.join('\n');
            }

            logger.log(`${sql}\n`);
        } else {
            logger.log(Connection.debug(sql, inserts));
        }

        logger.log(' == MYSQL QUERY DEBUG ==');
        logger.log(' ');
    }

    /**
     * @param {String/Sencha.mysql.Connection} connection The connection to suspend.
     */
    suspend (connection) {
        const me = this;

        if (connection) {
            me.get(connection).suspended = true;
        } else {
            me
                .get()
                .forEach(me.suspend.bind(me));
        }
    }

    /**
     * @param {String/Sencha.mysql.Connection} connection The connection to resume. If
     * any queries were batched while the connection was suspended, these will now be
     * executed.
     */
    resume (connection) {
        const me = this;

        if (connection) {
            me.get(connection).suspended = false;
        } else {
            me
                .get()
                .forEach(me.resume.bind(me));
        }
    }

    /**
     * @param {String/Sencha.mysql.Connection} connection The connection to check if
     * it is suspended.
     * @return {Boolean} Whether the connection is suspended or not.
     */
    isSuspended (connection) {
        return this.get(connection).suspended;
    }

    /**
     * @param {String/Sencha.mysql.Connection} connection The connection to query.
     * @param {String/Array} sqls The sql statement(s) to query with.
     * @param {Array} inserts The insert parameters to apply onto the sql statements.
     * @return {Promise} The promise will resolve when the associated query has finished.
     */
    query (connection, sqls, inserts) {
        connection = this.get(connection);

        if (connection) {
            return connection.query(sqls, inserts);
        } else {
            return new Promise((resolve, reject) => {
                reject(new Error(`No connection found`));
            });
        }
    }

    /**
     * Execute the queries within a MySQL transaction.
     *
     * @param {String/Sencha.mysql.Connection} connection The connection to query.
     * @param {String/Array} sqls The sql statement(s) to query with.
     * @param {Array} inserts The insert parameters to apply onto the sql statements.
     * @return {Promise} The promise will resolve when the associated query has finished.
     */
    transact (connection, sqls, inserts) {
        connection = this.get(connection);

        if (connection) {
            return connection.transact(sqls, inserts);
        } else {
            return new Promise((resolve, reject) => {
                reject(new Error(`No connection found`));
            });
        }
    }
}

module.exports = new Manager();
