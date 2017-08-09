const { util : { Logger } } = require('../../');

class RemoveFromDatabase {
    execute (runner) {
        return new Promise((resolve) => {
            const {
                info : {
                    app : { database },
                    moduleCfg : { mysql : { table } }
                }
            } = runner;

            const nightlies = runner.getData('oldNightlies');

            if (Array.isArray(nightlies) && nightlies.length) {
                Logger.info('Removing old nightlies from database...');

                database
                    .query(
                        `DELETE FROM ${table} WHERE id IN (?);`,
                        [
                            nightlies.map(nightly => nightly.id)
                        ]
                    )
                    .then(() => {
                        Logger.info('Old nightlies removed from database.');

                        resolve();
                    })
                    .catch((error) => {
                        Logger.error(error);

                        resolve();
                    });
            } else {
                Logger.info('No old nightlies to remove from database...');

                resolve();
            }
        });
    }
}

module.exports = RemoveFromDatabase;
