const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

function onLoad (result) {
    if (Array.isArray(result)) {
        return  result[ 0 ];
    }

    return result;
}

/**
 * @class Sencha.fiddle.mysql.operation.Permission.Fiddle.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for fiddle fiddle permissions.
 */
class Permission extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddlePermissionFiddleGetter
                 */
                isFiddlePermissionFiddleGetter : true
            }
        };
    }

    /**
     * Retrieves the fiddle permission information for the given user.
     * @param {Number} fiddleid The real fiddle id to retrieve.
     * @param {Number} userid The user id to get permissions for.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    get (fiddleid, userid, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                userid,
                userid,
                userid,
                fiddleid
            ];
            const query   = new Query({
                inserts,
                sqls : `SELECT
    IF(
        MIN(permission.permission) = 0,
        IFNULL(permission.public_read, 0),
        MAX(permission.permission)
    ) AS permission
FROM (
    SELECT
        fiddle_teams_fiddles.fiddleid,
        IF(
            fiddles.userid = ?,
            4,
            IFNULL(
                fiddle_teams_users.permission,
                IF(fiddle_teams.creator = ?, 4, NULL)
            )
        ) AS permission,
        IFNULL(
            fiddle_permission.public_read,
            teams.public_read
        ) AS public_read
        FROM fiddles
        LEFT JOIN fiddle_teams_fiddles ON fiddle_teams_fiddles.fiddleid = fiddles.id
        LEFT JOIN fiddle_teams ON fiddle_teams.id = fiddle_teams_fiddles.teamid
        LEFT JOIN fiddle_teams_users ON fiddle_teams_users.teamid = fiddle_teams.id AND fiddle_teams_users.userid = ?
        LEFT JOIN fiddle_permission ON fiddle_permission.fiddleid = fiddles.id
        LEFT JOIN (
            SELECT
                fiddle_teams_fiddles.fiddleid,
                fiddle_teams.public_read
            FROM fiddle_teams_fiddles
            JOIN fiddle_teams ON fiddle_teams.id = fiddle_teams_fiddles.teamid
            ORDER BY fiddle_teams.public_read DESC
            LIMIT 1
        ) teams ON teams.fiddleid = fiddles.id
    WHERE fiddles.id = ?
) permission
GROUP BY permission.fiddleid;`
            });

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }

    getForUpdate (fiddleid, userid, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query();

            if (fiddleid && userid) {
                query.inserts = [
                    userid,
                    userid,
                    userid,
                    fiddleid
                ];

                query.sqls = `SET @permission = (SELECT
    IF(
        MIN(permission.permission) = 0,
        IFNULL(permission.public_read, 0),
        MAX(permission.permission)
    ) AS permission
FROM (
    SELECT
        fiddle_teams_fiddles.fiddleid,
        IF(
            fiddles.userid = ?,
            4,
            IFNULL(
                fiddle_teams_users.permission,
                IF(fiddle_teams.creator = ?, 4, NULL)
            )
        ) AS permission,
        IFNULL(
            fiddle_permission.public_read,
            teams.public_read
        ) AS public_read
        FROM fiddles
        LEFT JOIN fiddle_teams_fiddles ON fiddle_teams_fiddles.fiddleid = fiddles.id
        LEFT JOIN fiddle_teams ON fiddle_teams.id = fiddle_teams_fiddles.teamid
        LEFT JOIN fiddle_teams_users ON fiddle_teams_users.teamid = fiddle_teams.id AND fiddle_teams_users.userid = ?
        LEFT JOIN fiddle_permission ON fiddle_permission.fiddleid = fiddles.id
        LEFT JOIN (
            SELECT
                fiddle_teams_fiddles.fiddleid,
                fiddle_teams.public_read
            FROM fiddle_teams_fiddles
            JOIN fiddle_teams ON fiddle_teams.id = fiddle_teams_fiddles.teamid
            ORDER BY fiddle_teams.public_read DESC
            LIMIT 1
        ) teams ON teams.fiddleid = fiddles.id
    WHERE fiddles.id = ?
) permission
GROUP BY permission.fiddleid);`;
            } else {
                query.sqls = `SET @permission = 1;`;
            }

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }
}

module.exports = Permission;
