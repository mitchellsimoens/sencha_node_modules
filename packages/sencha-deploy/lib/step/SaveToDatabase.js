const { util : { Logger } } = require('../');

class SaveToDatabase {
    execute (runner) {
        const {
            info : {
                args,
                file,
                product,
                app : { database },
                moduleCfg : {
                    mysql : { table }
                }
            }
        } = runner;

        const _platform = args.platform ? args.platform.replace(/\s+/g, '-').toLowerCase() : null;
        const platform  = args.platform ? `(${args.platform})` : '';
        const data      = {
            active         : args.active    ? args.active    : 0,
            dashboard      : args.dashboard ? args.dashboard : 0,
            jre            : args.jre || false,
            license        : args.license,
            md5            : file.md5,
            name           : args.name ? args.name : `${product.name} ${args.version} ${platform}`.trim(),
            platform       : _platform,
            product_id     : product.id, // eslint-disable-line camelcase
            release_date   : `${new Date().toISOString().substr(0, 10)} 00:00:00`, // eslint-disable-line camelcase,newline-per-chained-call
            sha1           : file.sha1,
            version        : args.version + (_platform ? `-${_platform}` : args.license ? `-${args.license}` : ''),
            versionDisplay : args.version
        };

        Logger.info('Inserting into database...');

        return database
            .query(
                `INSERT INTO ${table} SET ?;`,
                [ data ]
            )
            .then(
                (result) => {
                    Logger.info('Inserted into database.');

                    this.result = result;
                },
                (e) => {
                    Logger.error('Could not insert into database.');

                    return e;
                }
            );
    }

    undo (runner) {
        const { result : { insertId } } = this;
        const {
            info : {
                app       : { database },
                moduleCfg : {
                    mysql : { table }
                }
            }
        } = runner;

        Logger.info('Removing from database...');

        return database
            .query(
                `DELETE FROM ${table} WHERE id = ?;`,
                [ insertId ]
            )
            .then(
                () => {
                    Logger.info('Removed from database.');
                },
                (e) => {
                    Logger.error('Could not remove from database.');

                    return e;
                }
            );
    }
}

module.exports = SaveToDatabase;
