const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

function onLoad (result) {
    if (Array.isArray(result)) {
        return result[ 0 ];
    }

    return result;
}

/**
 * @class Sencha.fiddle.mysql.operation.Permission.Team.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for fiddle team permissions.
 */
class Permission extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddlePermissionTeamGetter
                 */
                isFiddlePermissionTeamGetter : true
            }
        };
    }

    /**
     * Retrieves the team permission information for the given user.
     * @param {Number} teamid The team id to retrieve.
     * @param {Number} userid The user id to get permissions for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    get (teamid, userid, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                userid,
                userid,
                teamid
            ];
            const query   = new Query({
                inserts,
                sqls : `SELECT
    IF(
        fiddle_teams.creator = ?,
        4,
        IFNULL(fiddle_teams_users.permission, 1)
    ) AS permission
FROM fiddle_teams
LEFT JOIN fiddle_teams_users ON fiddle_teams_users.teamid = fiddle_teams.id AND fiddle_teams_users.userid = ?
WHERE fiddle_teams.id = ?;`
            });

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }

    getForCreate (teamid, userid, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query();

            if (teamid) {
                query.inserts = [
                    userid,
                    userid,
                    teamid
                ];

                query.sqls = `SET @permission = (
SELECT
    IF(
        fiddle_teams.creator = ?,
        4,
        IFNULL(fiddle_teams_users.permission, 1)
    ) AS permission
FROM fiddle_teams
LEFT JOIN fiddle_teams_users ON fiddle_teams_users.teamid = fiddle_teams.id AND fiddle_teams_users.userid = ?
WHERE fiddle_teams.id = ?
                );`;
            } else {
                query.sqls = 'SET @permission = 4;';
            }

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }
}

module.exports = Permission;
