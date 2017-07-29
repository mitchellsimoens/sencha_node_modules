const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.Fiddle.update
 * @extends Sencha.core.Base
 *
 * A class to manage all UPDATE operations for fiddle assets.
 */
class Fiddle extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleUpdater
                 */
                isFiddleUpdater : true
            }
        };
    }

    incrementRun (fiddleid, batch) {
        return new Promise((resolve, reject) => {
            const query   = new Query({
                inserts : [ fiddleid ],
                sqls    : 'UPDATE fiddles SET runs = runs + 1 WHERE id = ?;'
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    update (data, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.forkid,
                data.userid,
                data.username,
                data.frameworkid,
                data.frameworkVersion,
                data.title,
                data.description,
                data.index,
                data.password,
                data.rtl,
                data.version,
                data.id
            ];
            const query   = new Query({
                inserts,
                sqls : `UPDATE fiddles
SET
    \`forkid\`           = ?,
    \`userid\`           = ?,
    \`username\`         = ?,
    \`frameworkid\`      = ?,
    \`frameworkVersion\` = ?,
    \`modifiedDate\`     = NOW(),
    \`title\`            = ?,
    \`description\`      = ?,
    \`index\`            = ?,
    \`password\`         = ?,
    \`rtl\`              = ?,
    \`version\`          = ?
WHERE \`id\` = ? AND @permission > 1;`
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }
}

module.exports = Fiddle;
