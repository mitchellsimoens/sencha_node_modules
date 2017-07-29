const { Base, Config } = require('@extjs/sencha-core');
const { Query }        = require('@extjs/sencha-mysql');

const useridRe = /[0-9]+/;

function onLoad (result) {
    if (Array.isArray(result)) {
        return result[0];
    }

    return result
}

/**
 * @class Sencha.login.mysql.operation.Forum.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for forum user resources.
 */
class Forum extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isForumGetter
                 */
                isForumGetter : true
            }
        };
    }

    /**
     * Retrieves the user information.
     * @param {Number/String} userid The user id or email lookup the user.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getById (userid, batch) {
        const tokenConfig = Config.get('operation.api.token');
        const field       = useridRe.test(userid) ?
            `${tokenConfig.forumUserTable}.userid = ?` :
            `${tokenConfig.forumUserTable}.email = ? OR ${tokenConfig.forumUserTable}.username = ?`;

        const query = new Query({
            inserts : [ userid, userid ],
            sqls    : `SELECT
                ${tokenConfig.forumUserTable}.userid
            FROM ${tokenConfig.forumUserTable}
            WHERE ${field}
            LIMIT 1;`
        });

        batch.add(query);

        return query
            .then(onLoad)
            .then(data => {
                if (!data) {
                    throw new Error('User not found');
                }

                return data;
            });
    }

    /**
     * Retrieves the user information.
     * @param {Number/String} userid The user id or email lookup the user.
     * @param {String} password The raw password to check.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    checkPassword (userid, password, batch) {
        const tokenConfig = Config.get('operation.api.token');
        const field       = useridRe.test(userid) ?
            `${tokenConfig.forumUserTable}.userid = ?` :
            `${tokenConfig.forumUserTable}.email = ? OR ${tokenConfig.forumUserTable}.username = ?`;

        const query = new Query({
            inserts : [ password, userid, userid ],
            sqls    : `SELECT
                IF(
                	md5(
                        CONCAT(
                            md5(?),
                            ${tokenConfig.forumUserTable}.salt
                        )
                    ) = ${tokenConfig.forumUserTable}.password,
                	1,
                	0
                ) AS password
            FROM user
            WHERE ${field}
            LIMIT 1;`
        });

        batch.add(query);

        return query
            .then(onLoad)
            .then(data => {
                if (!data) {
                    throw new Error('User not found');
                }

                return data;
            })
            .then(data => {
                if (data.password) {
                    return true;
                } else {
                    throw new Error('Password did not match our records');
                }
            });
    }
}

module.exports = Forum;
