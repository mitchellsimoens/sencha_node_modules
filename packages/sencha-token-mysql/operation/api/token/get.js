const Base = require('../../Base');

/**
 * @class Sencha.token.mysql.operation.Token.get
 * @extends Sencha.token.mysql.operation.Base
 *
 * A class to manage all GET operations for tokens.
 */
class Token extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isTokenGetter
                 */
                isTokenGetter : true
            }
        };
    }

    /**
     * Retrieves the token.
     * @param {Object} info Info about the token to be retrieved.
     * @param {String} [info.system=sencha]
     * @param {String} info.token
     * @param {String} [info.type=access] Can be `code`, `access`, or `refresh`.
     * @param {Number} userid
     * @return {Promise}
     */
    get (info = { }) {
        const {
            system, token, type, userid
        } = info;
        const inserts  = [];
        const wheres   = [];
        const fields   = [
            `${this.tokensTable}.*`
        ];
        let   userJoin = '';

        if (system) {
            inserts.push(system);
            wheres.push(`${this.tokensTable}.system = ?`);

            if (system === 'sencha') {
                fields.push(...[
                    'uid',
                    'user_type',
                    'display_name'
                ].map(field => `${this.senchaUserTable}.${field}`));

                userJoin = `LEFT JOIN ${this.senchaUserTable} ON ${this.senchaUserTable}.uid = ${this.tokensTable}.userid`;
            } else {
                fields.push(...[
                    'userid', 'username'
                ].map(field => `${this.forumUserTable}.${field}`));

                userJoin = `LEFT JOIN ${this.forumUserTable} ON ${this.forumUserTable}.userid = ${this.tokensTable}.userid`;
            }
        }

        if (type) {
            inserts.push(type);

            if (Array.isArray(type)) {
                wheres.push(`${this.tokensTable}.type IN (?)`);
            } else {
                wheres.push(`${this.tokensTable}.type = ?`);
            }
        }

        if (token) {
            inserts.push(token);

            if (Array.isArray(token)) {
                wheres.push(`${this.tokensTable}.token IN (?)`);
            } else {
                wheres.push(`${this.tokensTable}.token = ?`);
            }
        }

        if (userid) {
            inserts.push(userid);

            if (Array.isArray(userid)) {
                wheres.push(`${this.tokensTable}.userid IN (?)`);
            } else {
                wheres.push(`${this.tokensTable}.userid = ?`);
            }
        }

        return this
            .exec({
                inserts,
                sqls : `SELECT ${fields.join()}
                    FROM ${this.tokensTable}
                    ${userJoin}
                    WHERE ${wheres.join(' AND ')}
                    LIMIT 1;`
            })
            .then(this.flatten.bind(this));
    }
}

module.exports = Token;
