const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

const uidRe = /[0-9]+/;

function onLoad (result) {
    if (Array.isArray(result)) {
        return result[ 0 ];
    }

    return result;
}

/**
 * @class Sencha.login.mysql.operation.Sencha.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for sencha user resources.
 */
class Sencha extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isSenchaGetter
                 */
                isSenchaGetter : true
            }
        };
    }

    /**
     * Retrieves the user information.
     * @param {Number/String} uid The user id or email lookup the user.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getById (uid, batch) {
        const field = uidRe.test(uid) ? 'user.uid = ?' : 'user.email = ? OR user.auth_data = ?';
        const query = new Query({
            inserts : [ uid, uid ],
            sqls    : `SELECT
                user.auth_data,
                user.dashboard,
                user.display_name,
                user.email,
                user.inactive,
                user.locale,
                user.owner_group_id,
                user.raw_signature,
                user.receive_email,
                user.round_robin,
                user.signature,
                user.tier,
                user.uid,
                user.user_type,
                CASE user.user_type = "user" WHEN 0 THEN 1 END AS isAdmin
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
            });
    }

    /**
     * Retrieves the user information.
     * @param {Number/String} uid The user id or email lookup the user.
     * @param {String} password The raw password to check.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    checkPassword (uid, password, batch) {
        const field = uidRe.test(uid) ? 'uid' : 'email';
        const query = new Query({
            inserts : [ password, uid ],
            sqls    : `SELECT
                IF(
                    md5(?) = user.password,
                    1,
                    0
                ) AS password
            FROM user
            WHERE user.${field} = ?
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

module.exports = Sencha;
