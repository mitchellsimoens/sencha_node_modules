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
                 * @property {Boolean} isTokenCreater
                 */
                isTokenCreater : true,

                config : { // eslint-disable-line sort-keys
                    /**
                     * @cfg {Object} timeframes The timeframes for token expirary.
                     *
                     * Defaults to:
                     *
                     *     {
                     *         access  : 'INTERVAL 30 MINUTE',
                     *         code    : 'INTERVAL 2 MINUTE',
                     *         refresh : 'INTERVAL 36 HOUR'
                     *     }
                     */
                    timeframes : {
                        access  : 'INTERVAL 30 MINUTE',
                        code    : 'INTERVAL 2 MINUTE',
                        refresh : 'INTERVAL 36 HOUR'
                    }
                }
            }
        };
    }

    /**
     * Creates a token.
     * @param {Object} info
     * @return {Promise}
     */
    create (info = { }) {
        const {
            key, scopes, system = 'sencha', userid
        } = info;
        const inserts = [];
        const sqls    = [];
        let   { type } = info;

        if (!Array.isArray(type)) {
            type = [ type ];
        }

        type.forEach(type => {
            const token     = this.generate();
            const timeframe = this.timeframes[ type ];

            inserts.push(
                // start of INSERT inserts
                type,
                system,
                userid,
                key,
                token,
                scopes,
                // start of SELECT inserts
                token,
                userid
            );

            sqls.push(
                `INSERT INTO ${this.tokensTable} (\`type\`, \`system\`, \`userid\`, \`key\`, \`token\`, \`scopes\`, \`created\`, \`expires\`) VALUES (?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), ${timeframe}));`,
                `SELECT type, token, expires, system FROM ${this.tokensTable} WHERE token = ? AND userid = ? ORDER BY expires DESC LIMIT 1;`
            );
        });

        return this
            .exec({
                inserts,
                sqls
            })
            .then(results => results.filter(result => !Object.prototype.hasOwnProperty.call(result, 'affectedRows')))
            .then(this.flatten.bind(this));
    }
}

module.exports = Token;
