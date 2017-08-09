const { util : { Logger } } = require('../../');

class RemoveFromStorage {
    _cloneObj (obj, newObj = {}) {
        for (let i in obj) {
            if (typeof obj[i] === 'object' && Object.keys(obj[i]).length) {
                newObj[i] = this._cloneObj(obj[i], newObj[i]);
            } else {
                newObj[i] = obj[i];
            }
        }

        return Object.assign({}, newObj);
    }

    execute (runner) {
        return new Promise((resolve) => {
            const {
                info
            } = runner;
            const {
                app : { storage }
            } = info;

            const nightlies = runner.getData('oldNightlies');

            if (Array.isArray(nightlies) && nightlies.length) {
                Logger.info('Removing old nightlies from storage...');

                Promise
                    .all(
                        nightlies.map(nightly => {
                            if (nightly.num_shared > 1) {
                                return true;
                            } else {
                                return storage.remove(
                                    this._cloneObj(
                                        {
                                            file : {
                                                sha1 : nightly.sha1
                                            }
                                        },
                                        info
                                    )
                                );
                            }
                        })
                    )
                    .then(() => {
                        Logger.info('Old nightlies removed from storage.');

                        resolve();
                    })
                    .catch((error) => {
                        Logger.error(error);

                        resolve();
                    });
            } else {
                Logger.info('No old nightlies to remove from storage...');

                resolve();
            }
        });
    }
}

module.exports = RemoveFromStorage;
