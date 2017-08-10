const {
    error : { FatalError }
} = require('../');

const Connection = require('./Connection');

module.exports = {
    create (type, config) {
        return new Promise((resolve, reject) => {
            const cls = this[ type ];

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

    get Connection () { // eslint-disable-line sort-keys
        return Connection;
    },

    get MySQL () {
        return require('./MySQL.js'); // eslint-disable-line global-require
    },

    get mysql () {
        return require('./MySQL.js'); // eslint-disable-line global-require
    }
};
