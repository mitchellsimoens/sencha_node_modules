const { util : { Logger } } = require('../');

class SaveToStorage {
    execute (runner) {
        const { info } = runner;
        const existing = runner.getData('existing');
        let   force    = info.args.forceStorageUpload;

        if (force == null) {
            force = info.moduleCfg.forceStorageUpload;
        }

        if (existing && !force) {
            //file should already be uploaded and not forced

            Logger.info('Skipping storage...');

            return true;
        } else {
            Logger.info('Uploading to storage...');

            return info.app.storage
                .upload(info)
                .then((data) => {
                    Logger.info('Uploaded to storage.');

                    this.result = data;
                })
                .catch(error => {
                    Logger.error('Could not upload to storage.');

                    throw error;
                });
        }
    }

    undo (runner) {
        if (this.result) {
            Logger.info('Removing from storage...');

            return runner.info.app.storage
                .remove(this.result)
                .then(
                    () => {
                        Logger.info('Removed from storage.');
                    },
                    (e) => {
                        Logger.error('Could not remove from storage.');

                        return e;
                    }
                );
        } else {
            Logger.info('Skipping removal from storage...');

            return true;
        }
    }
}

module.exports = SaveToStorage;
