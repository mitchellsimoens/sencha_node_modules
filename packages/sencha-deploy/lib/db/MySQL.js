const mysql  = require('mysql');

const { util : { Logger } } = require('../');

class MySQL {
    constructor (config = { db : { } }) {
        config = config.db ? config.db : config;

        Object.assign(this, {
            multipleStatements : config.multipleStatements,
            timezone           : config.timezone
        });

        Object.assign(this, {
            database   : process.env.DB_DATABASE,
            host       : process.env.DB_HOST,
            password   : process.env.DB_PASSWORD,
            port       : process.env.DB_PORT,
            socketPath : process.env.DB_SOCKET_PATH,
            user       : process.env.DB_USER
        });
    }

    getConnectionConfig () {
        return {
            database           : this.database,
            host               : this.host,
            multipleStatements : this.multipleStatements,
            password           : this.password,
            port               : this.port,
            socketPath         : this.socketPath,
            timezone           : this.timezone,
            user               : this.user
        };
    }

    createConnection (connect = true) {
        const config     = this.getConnectionConfig();
        const connection = mysql.createConnection(config);

        connect && connection.connect();

        return connection;
    }

    debug (sql, inserts) {
        if (Array.isArray(sql)) {
            sql = sql.join('');
        }

        Logger.debug(' ');
        Logger.debug(' == MYSQL QUERY DEBUG START ==');

        if (!inserts || !inserts.length) {
            Logger.debug(sql);
        } else {
            Logger.debug(
                `\n\n${mysql.format(sql, inserts).split(';').join(';\n')}` // eslint-disable-line newline-per-chained-call
            );
        }

        Logger.debug(' == MYSQL QUERY DEBUG END ==');
        Logger.debug(' ');
    }

    query (sql, inserts) {
        return new Promise((resolve, reject) => {
            const connection = this.createConnection();

            this.debug(sql, inserts);

            if (Array.isArray(sql)) {
                sql = sql.join('');
            }

            connection.query(
                sql,
                inserts,
                (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                }
            );

            connection.end();
        });
    }

    ping () {
        return new Promise((resolve, reject) => {
            const connection = this.createConnection();

            this
                .doPing(connection)
                .then(connection.end.bind(connection))
                .then(resolve, reject);
        });
    }

    doPing (connection) {
        return new Promise((resolve, reject) => {
            connection.ping(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = MySQL;
