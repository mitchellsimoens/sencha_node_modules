const { Base, Config } = require('@extjs/sencha-core');
const { Query }        = require('@extjs/sencha-mysql');

function onLoad (result) {
    if (Array.isArray(result)) {
        return result[0];
    }

    return result
}

/**
 * @class Sencha.login.mysql.operation.Login.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for login resources.
 */
class Login extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isLoginGetter
                 */
                isLoginGetter : true
            }
        };
    }

    getForumByToken (token, batch) {
        const tokenConfig = Config.get('operation.api.token');

        const query = new Query({
            inserts : [ token ],
            sqls    : `SELECT
                        ${tokenConfig.tokensTable}.scopes,
                        ${tokenConfig.forumUserTable}.password,
                        ${tokenConfig.forumUserTable}.userid,
                        ${tokenConfig.forumUserTable}.username,
	                    ${tokenConfig.senchaUserTable}.uid
                    FROM ${tokenConfig.tokensTable}
                    JOIN ${tokenConfig.forumUserTable} ON ${tokenConfig.forumUserTable}.userid = ${tokenConfig.tokensTable}.userid
                    LEFT JOIN ${tokenConfig.senchaUserTable} ON ${tokenConfig.senchaUserTable}.auth_data = ${tokenConfig.forumUserTable}.username
                    WHERE ${tokenConfig.tokensTable}.system = "forum" AND ${tokenConfig.tokensTable}.token = ? AND ${tokenConfig.tokensTable}.expires > NOW();`
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

    getSenchaByToken (token, batch) {
        const tokenConfig = Config.get('operation.api.token');

        const query = new Query({
            inserts : [ token ],
            sqls    : `SELECT
                        ${tokenConfig.tokensTable}.scopes,
                        ${tokenConfig.forumUserTable}.password,
                        ${tokenConfig.forumUserTable}.userid,
                        ${tokenConfig.forumUserTable}.username,
	                    ${tokenConfig.senchaUserTable}.uid
                    FROM ${tokenConfig.tokensTable}
                    JOIN ${tokenConfig.senchaUserTable} ON ${tokenConfig.senchaUserTable}.uid = ${tokenConfig.tokensTable}.userid
                    LEFT JOIN ${tokenConfig.forumUserTable} ON ${tokenConfig.forumUserTable}.username = ${tokenConfig.senchaUserTable}.auth_data
                    WHERE ${tokenConfig.tokensTable}.system = "sencha" AND ${tokenConfig.tokensTable}.token = ? AND ${tokenConfig.tokensTable}.expires > NOW();`
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

    getSenchaFromForum (userid, batch) {
        const tokenConfig = Config.get('operation.api.token');

        const query = new Query({
            inserts : [ userid ],
            sqls    : `SELECT
                        ${tokenConfig.senchaUserTable}.uid
                    FROM ${tokenConfig.forumUserTable}
                    JOIN ${tokenConfig.senchaUserTable} ON ${tokenConfig.senchaUserTable}.auth_data = ${tokenConfig.forumUserTable}.username
                    WHERE ${tokenConfig.forumUserTable}.userid = 22216
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
}

module.exports = Login;
