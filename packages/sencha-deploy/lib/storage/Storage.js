const {
    error : { FatalError },
    util  : { Logger }
} = require('../');

class Storage {
    constructor (config) {
        if (config) {
            this.config = config;
        }
    }

    create (Cls, config = this.config) {
        this.storage = new Cls(config);

        return this;
    }

    ping () {
        return new Promise((resolve, reject) => {
            Logger.info('Storage connection initializing...');

            this.storage
                .ping()
                .then(() => {
                    Logger.info('Storage connection initialized.');

                    resolve(this);
                })
                .catch(error => {
                    Logger.error(error);

                    reject(new FatalError('Unable to connect to the storage.'));
                });
        });
    }

    upload (...args) {
        return new Promise((resolve, reject) => {
            this.storage
                .upload(...args)
                .then(resolve)
                .catch(() => reject(new FatalError('Unable to upload to the storage.')));
        });
    }

    remove (...args) {
        return new Promise((resolve, reject) => {
            this.storage
                .remove(...args)
                .then(resolve)
                .catch(() => reject(new Error('Unable to remove the file from storage.')));
        });
    }
}

module.exports = Storage;
