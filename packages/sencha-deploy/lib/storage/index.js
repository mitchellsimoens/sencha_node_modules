const {
    error : { FatalError }
} = require('../');

const Storage = require('./Storage');

module.exports = {
    create (type, config) {
        return new Promise((resolve, reject) => {
            const Cls = this[ type ];

            if (Cls) {
                const instance = new Storage(config);

                instance
                    .create(Cls)
                    .ping()
                    .then(resolve, reject);
            } else {
                reject(new FatalError('Storage is not recognized'));
            }
        });
    },

    get S3 () { // eslint-disable-line sort-keys
        return require('./S3'); // eslint-disable-line global-require
    },

    get Storage () {
        return Storage;
    },

    get s3 () {
        return this.S3;
    }
};
