const Base = require('../../Base');

/**
 * @class Sencha.token.mysql.operation.Token.delete
 * @extends Sencha.token.mysql.operation.Base
 *
 * A class to manage all DELETE operations for tokens.
 */
class Token extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} [isTokenDeleter=true]
                 */
                isTokenDeleter : true
            }
        };
    }

    /**
     * Deletes tokens.
     * @param {Object} info Info about the token to be delete.
     * @param {String} info.system
     * @param {String} info.token
     * @param {String} info.type Can be `code`, `access`, or `refresh`.
     * @param {Number} userid
     * @return {Promise}
     */
    delete (info = { }) {
        const {
            system, token, type, userid
        } = info;
        const inserts = [];
        const wheres  = [];

        if (system) {
            inserts.push(system);

            if (Array.isArray(system)) {
                wheres.push(`${this.tokensTable}.system IN (?)`);
            } else {
                wheres.push(`${this.tokensTable}.system = ?`);
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
                sqls : `DELETE
                    FROM ${this.tokensTable}
                    WHERE ${wheres.join(' AND ')}
                    LIMIT ${this.deleteLimit};`
            })
            .then(() => {
                return {
                    success : true
                };
            });
    }
}

module.exports = Token;
