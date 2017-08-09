const {
    error : { FatalError }
} = require('../');

const Connection = require('./Connection');

module.exports = {
    create (type, config) {
        return new Promise((resolve, reject) => {
            const cls = this[type];

            if (cls) {
                const instance = new Connection(config);

                instance
                    .create(cls)
                    .ping()
                    .then(resolve, reject);
            } else {
                reject(new FatalError('Database is not recognized'));
            }
        });
    },

    get Connection () {
        return Connection;
    },

    get mysql () {
        return require('./MySQL.js');
    },

    get MySQL () {
        return require('./MySQL.js');
    }
};
