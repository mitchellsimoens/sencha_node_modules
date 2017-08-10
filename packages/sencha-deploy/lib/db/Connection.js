const {
    error : { FatalError },
    util  : { Logger }
} = require('../');

class Connection {
    constructor (config) {
        if (config) {
            this.config = config;
        }
    }

    create (Cls, config = this.config) {
        this.connection = new Cls(config);

        return this;
    }

    ping () {
        return new Promise((resolve, reject) => {
            Logger.info('Database connection initializing...');

            this.connection
                .ping()
                .then(() => {
                    Logger.info('Database connection initialized.');

                    resolve(this);
                })
                .catch(error => {
                    Logger.error(error);

                    reject(new FatalError('Unable to connect to the database.'));
                });
        });
    }

    query (...args) {
        return new Promise((resolve, reject) => {
            this
                .connection
                .query(...args)
                .then(resolve)
                .catch(reject);
        });
    }

    debug (...args)  {
        this.connection.debug(...args);
    }
}

module.exports = Connection;
