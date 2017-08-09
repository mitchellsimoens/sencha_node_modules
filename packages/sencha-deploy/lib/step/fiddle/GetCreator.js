const {
    error : { FatalError },
    step  : { fiddle : { Base } },
    util  : { Logger }
} = require('../../');

class GetCreator extends Base {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const { info }     = runner;
            const databaseName = this.getDatabase('ext_forum');
            const {
                args : {
                    userid
                },
                app  : {
                    database
                }
            } = info;

            const field = /\d+/.test(userid) ? 'userid' : 'username';

            Logger.info('Retreiving creator user from database...');

            database
                .query(
                    `SELECT userid,username FROM ${databaseName}.user WHERE ${field} = ? LIMIT 1;`,
                    [
                        userid
                    ]
                )
                .then(user => {
                    if (Array.isArray(user)) {
                        [ user ] = user;
                    }

                    if (user) {
                        Logger.info('Retrieved creator user from database.');

                        info.user = user;

                        resolve();
                    } else {
                        reject(new FatalError('User is not found.'));
                    }
                })
                .catch(reject);
        });
    }
}

module.exports = GetCreator;
