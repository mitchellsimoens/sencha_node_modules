const Base = require('../../Base');

/**
 * @class Sencha.token.mysql.operation.Key.get
 * @extends Sencha.token.mysql.operation.Base
 *
 * A class to manage all GET operations for keys.
 */
class Key extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} [isKeyGetter=true]
                 */
                isKeyGetter : true
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
    get (info = {}) {
        const { domain, key } = info;
        const inserts = [];
        const wheres  = [];
        const fields  = [
            `${this.keysTable}.*`
        ];

        if (key) {
            wheres.push('`key` = ?');

            inserts.push(key);
        }

        if (domain) {
            wheres.push('FIND_IN_SET(?, `originUrls`)');

            inserts.push(domain);
        }

        return this
            .exec({
                inserts,
                sqls : `SELECT ${fields.join()}
                    FROM ${this.keysTable}
                    WHERE ${wheres.join(' AND ')}
                    LIMIT 1;`
            }, false)
            .then(this.flatten.bind(this));
    }
}

module.exports = Key;
