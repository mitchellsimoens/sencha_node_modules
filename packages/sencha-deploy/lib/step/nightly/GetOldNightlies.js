const { util : { Logger } } = require('../../');

class GetOldNightlies {
    execute (runner) {
        return new Promise((resolve) => {
            const {
                info : {
                    app       : { database },
                    moduleCfg : { mysql : { min, table, ttl } },
                    product   : { id }
                }
            } = runner;

            const inserts  = [
                id,
                id
            ];

            const sql = `SELECT
    COUNT(*) AS num_shared,
    ${table}.id
FROM ${table}
LEFT JOIN ${table} AS other_product_nightly ON other_product_nightly.sha1 = ${table}.sha1
WHERE
    ${table}.product_id = ? AND
    ${table}.deleted = 0 AND
    ${table}.release_date < (
        SELECT
            CASE
                WHEN COUNT(*) >= ${min}
                THEN DATE_SUB(CURDATE(), INTERVAL ${ttl} DAY)
                ELSE DATE_SUB(CURDATE(), INTERVAL (${ttl} + ( ${min} - COUNT(*))) DAY)
            END day_interval
        FROM (
            SELECT DISTINCT release_date
            FROM ${table}
            WHERE product_id = ? AND deleted = 0 AND release_date >= DATE_SUB(CURDATE(), INTERVAL ${ttl} DAY)
        ) temp_table
    )
GROUP BY ${table}.id;`;

            /**
             * TODO
             * This SQL can lead to orphans in the storage. Say there are 12 rows in the table
             * and this SQL finds that 2 of them should be removed. Those 2 share the same sha1
             * but the other 10 do not then the num_shared field will return 2 and the RemoveFromStorage
             * step will not remove the file from storage. This will lead to an orphan file as it should
             * have been removed.
             */
            /**
             * TODO
             * Would like this to only care about the dot version (x.x) that is being used. For example,
             * if we are adding an Ext JS 6.2.2.123 nightly, we should only care about 6.2 nightlies.
             * This would leave the other versions (like 4.2 and 5.1) alone for those nightly steps
             * which would allow the minimum of 5 for each dot release.
             */

            //database.debug(sql, inserts);

            Logger.info('Retreiving old nightlies...');

            database
                .query(sql, inserts)
                .then(nightlies => {
                    Logger.info(`Found ${nightlies.length} old nightlies.`);

                    runner.addData('oldNightlies', nightlies);

                    resolve();
                })
                .catch((error) => {
                    Logger.error(error);

                    resolve();
                });
        });
    }
}

module.exports = GetOldNightlies;
