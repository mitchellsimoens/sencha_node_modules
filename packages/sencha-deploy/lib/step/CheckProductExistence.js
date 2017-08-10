const { util : { Logger } } = require('../');

class CheckProductExistence {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const {
                info : {
                    app       : { database },
                    args      : { failOnDup },
                    file      : { sha1 },
                    moduleCfg : {
                        failOnDup : moduleFailOnDup,
                        mysql     : { table }
                    }
                }
            } = runner;

            Logger.info('Checking for any existing releases in database...');

            database
                .query(
                    `SELECT * FROM ${table} WHERE sha1 = ? ORDER BY release_date DESC LIMIT 1;`,
                    [
                        sha1
                    ]
                )
                .then(releases => {
                    if (releases.length) {
                        const fail = failOnDup == null ? moduleFailOnDup : failOnDup;

                        Logger.info('Release already in database.');

                        runner.addData('existing', releases[ 0 ]);

                        if (fail) {
                            reject(new Error('Such release already exists in the database.'));
                        } else {
                            resolve();
                        }
                    } else {
                        Logger.info('Found no existing releases.');

                        resolve();
                    }
                })
                .catch(reject);
        });
    }
}

module.exports = CheckProductExistence;
