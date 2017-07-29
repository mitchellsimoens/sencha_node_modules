const { Base }            = require('@extjs/sencha-core');
const { Batch, Query }    = require('./index');
const { Console }         = require('@extjs/sencha-debug');
const { Shutdown }        = require('@extjs/sencha-node');

const mysql = require('mysql');

/**
 * @class Sencha.mysql.Connection
 * @extends Sencha.core.Base
 *
 * The connection class that is responsible for managing the mysql
 * queries. A connection can be suspended and batch queries automatically.
 */

class Connection extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isMySQLConnection
                 */
                isMySQLConnection : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Boolean} [autoConnect=true] Automatically connect to mysql.
                     */
                    autoConnect : true,

                    /**
                     * @cfg {Number} [connectionLimit=10] The number of connections for the mysql pool.
                     */
                    connectionLimit : 10,

                    /**
                     * @cfg {String} database The database name to use.
                     */
                    database : null,

                    /**
                     * @cfg {String} host The host of the mysql server.
                     */
                    host : null,

                    /**
                     * @cfg {Boolean} [multipleStatements=true] `true` to allow multiple statements to be
                     * sent in a query.
                     */
                    multipleStatements : true,

                    /**
                     * @cfg {String} password The password of the mysql user.
                     */
                    password : null,

                    /**
                     * @cfg {Number} [port=3306] The port of the mysql server.
                     */
                    port : 3306,

                    /**
                     * @cfg {Number} queryTimeout The number of milliseconds till a query times out.
                     * **Note** This does not work with pool queries as the pools will manage themselves.
                     */
                    queryTimeout : null,

                    /**
                     * @property {Boolean} [suspended=false] Whether this connection is suspended.
                     * When suspended, any queries made will be batched until this connection is
                     * resumed.
                     */
                    suspended : false,

                    /**
                     * @cfg {Boolean} [usePool=true] Whether to use a pool or a single connection.
                     */
                    usePool : true,

                    /**
                     * @cfg {String} user The username of the mysql user.
                     */
                    user : null
                }
            }
        };
    }

    static debug (sql, inserts) {
        if (Array.isArray(sql)) {
            sql = sql.join('');
        }

        return mysql
            .format(sql, inserts)
            .split(';')
            .join(';\n');
    }

    get suspended () {
        return this._suspended;
    }

    set suspended (suspended) {
        const me = this;

        me._suspended = suspended;

        if (!suspended) {
            if (me.queryBatch) {
                me.queryBatch.catch(me.emptyFn);

                me.exec(me.queryBatch);
            }

            if (me.transactionBatch) {
                me.transactionBatch.catch(me.emptyFn);

                me.doTransact(me.transactionBatch);
            }

            Object.assign(me, {
                queryBatch       : null,
                transactionBatch : null
            });
        }
    }

    ctor () {
        const me = this;

        me.debug = Console.find(`mysql ${me[ me.nameProperty ]}`);

        me.close = me.close.bind(me);

        Shutdown.on(me.close);

        if (me.autoConnect && me.usePool) {
            me.connect();
        }
    }

    dtor () {
        Shutdown.un(this.close);

        this.close();

        this.debug.destroy();

        Object.assign(this, {
            queryBatch       : null,
            transactionBatch : null
        });
    }

    /**
     * Create the mysql pool and automatically connect to the mysql server.
     */
    connect () {
        const me  = this;
        const cfg = {
            database           : me.database,
            host               : me.host,
            multipleStatements : me.multipleStatements,
            password           : me.password,
            port               : me.port,
            user               : me.user
        };

        if (me.usePool) {
            me.$pool = mysql.createPool(
                Object.assign(
                    cfg,
                    {
                        connectionLimit : me.connectionLimit
                    }
                )
            );
        } else {
            me.$connection = mysql.createConnection(cfg);
        }
    }

    /**
     * @returns {Promise} The promise will resolve when the pool has closed.
     *
     * Close the mysql connection pool. This will happen automatically when
     * {@link Sencha.node.Shutdown} detects a shutdown.
     */
    close () {
        return new Promise((resolve) => {
            const me       = this;
            const promises = [];
            const { $connection : connection, $pool : pool } = me;

            if (connection || pool) {
                me.debug.log('Closing mysql connection and pool:', me[ me.nameProperty ]);
            }

            Object.assign(me, {
                $connection      : null,
                $pool            : null,
                queryBatch       : null,
                transactionBatch : null
            });

            if (connection) {
                promises.push(
                    new Promise(resolve => {
                        connection.destroy(resolve);
                    })
                );
            }

            if (pool) {
                promises.push(
                    new Promise(resolve => {
                        pool.end(resolve);
                    })
                );
            }

            if (promises.length) {
                Promise.all(promises).then(resolve, resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * @param {String/Array} sqls The sql(s) to query.
     * @param {Array} inserts The insert parameters to apply onto the sql statements.
     * @returns {Promise} The promise will resolve/reject when the query/batch has
     * been resolved or rejected.
     *
     * Query the mysql server. If this connection is suspended, will add the query to
     * the batch.
     */
    query (sqls, inserts) {
        if (this.suspended) {
            if (!this.queryBatch) {
                this.queryBatch = new Batch();
            }
        }

        return this.queryTransact(sqls, inserts);
    }

    /**
     * @param {String/Array} sqls The sql(s) to query.
     * @param {Array} inserts The insert parameters to apply onto the sql statements.
     * @returns {Promise} The promise will resolve/reject when the query/batch has
     * been resolved or rejected.
     *
     * Run the queries within a MySQL transaction. If this connection is suspended,
     * will add the query to the batch.
     */
    transact (sqls, inserts) {
        if (this.suspended) {
            if (!this.transactionBatch) {
                this.transactionBatch = new Batch();
            }
        }

        return this.queryTransact(sqls, inserts, true);
    }

    /**
     * @private
     * Shared method to handle adding queries to the proper batch if suspended or
     * executed the appropriate method to execute the batch.
     */
    queryTransact (sqls, inserts, isTransact = false) {
        const me    = this;
        const query = new Query({
            inserts,
            sqls
        });

        if (me.suspended) {
            if (isTransact) {
                me.transactionBatch.add(query);
            } else {
                me.queryBatch.add(query);
            }
        } else if (isTransact) {
            me.doTransact(query);
        } else {
            me.exec(query);
        }

        return query.deferred.promise;
    }

    /**
     * @private
     * @param {Sencha.mysql.Query/Sencha.mysql.Batch} query The {@link Sencha.mysql.Query} or
     * {@link Sencha.mysql.Batch} to execute.
     *
     * This will trigger the actual submitting of the query to the mysql server.
     */
    exec (query) {
        if (this.$pool) {
            this
                ._doExec(query)
                .then(query.resolve, query.reject);
        } else if (this.usePool) {
            query.reject(new Error(`This connection is not yet connected: ${this.name}`));
        } else {
            if (!this.autoConnect) {
                this.connect();
            }

            this
                ._doExec(query, this.$connection)
                .then(query.resolve, query.reject);
        }
    }

    /**
     * @private
     * Shared method to execute the queries. This can be executed as normal or
     * within a transaction.
     */
    _doExec (query, connection = this.$pool) {
        return new Promise((resolve, reject) => {
            let timeout;

            if ((!this.usePool || connection !== this.$pool) && this.queryTimeout) {
                timeout = setTimeout(() => {
                    connection.destroy();

                    this.$connection = null;

                    reject(new Error('Query timed out'));
                }, this.queryTimeout);
            }

            connection.query(
                query.sqlsSerialized,
                query.insertsSerialized,
                (error, results) => {
                    if (error) {
                        this.$connection = null;

                        reject(error);
                    } else if (this.usePool) {
                        resolve(results);
                    } else {
                        connection.end(() => {
                            this.$connection = null;

                            if (timeout) {
                                clearTimeout(timeout);
                            }

                            resolve(results);
                        });
                    }
                }
            );
        });
    }

    /**
     * @private
     * @param {Sencha.mysql.Query/Sencha.mysql.Batch} query The {@link Sencha.mysql.Query} or
     * {@link Sencha.mysql.Batch} to execute.
     *
     * This will trigger the actual submitting of the transaction to the mysql server.
     */
    doTransact (query) {
        if (this.$pool) {
            this.$pool.getConnection((error, connection) => {
                if (error) {
                    query.reject(error);
                } else {
                    this.doConnectionTransact(query, connection);
                }
            });
        } else if (this.usePool) {
            query.reject(new Error(`This connection is not yet connected: ${this.name}`));
        } else {
            if (!this.autoConnect) {
                this.connect();
            }

            this.doConnectionTransact(query);
        }
    }

    doConnectionTransact (query, connection = this.$connection) {
        connection.beginTransaction(error => {
            if (error) {
                query.reject(error);
            } else {
                this
                    ._doExec(query, connection)
                    .then(results => new Promise((resolve, reject) => {
                        connection.commit(error => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(results);
                            }
                        });
                    }))
                    .then(query.resolve)
                    .catch(error => connection.rollback(() => query.reject(error)));
            }
        });
    }
}

module.exports = Connection;
