const crypto                        = require('crypto');
const { operation : { Operation } } = require('@extjs/sencha-core');
const { Query }                     = require('@extjs/sencha-mysql');

class Base extends Operation {
    static get meta () {
        return {
            prototype : {
                /**
                 * @cfg {Number} [deleteLimit=10] The number of rows to delete
                 * when deleting tokens. The higher the limit, the possibility
                 * connections may hang.
                 */
                deleteLimit : 10,

                /**
                 * @readonly
                 * @property {Boolean} isTokenBaseOperation
                 */
                isTokenBaseOperation : true,

                forumUserTable  : 'ext_forum.user', // eslint-disable-line sort-keys
                keysTable       : 'engops_api.keys',
                senchaUserTable : 'ext_support.user',
                tokensTable     : 'engops_api.tokens'
            }
        };
    }

    exec (config, purgeExpired = true) {
        return new Promise((resolve, reject) => {
            if (purgeExpired) {
                let { sqls } = config;

                if (!Array.isArray(sqls)) {
                    sqls = [ sqls ];

                    config.sqls = sqls;
                }

                sqls.push(`DELETE FROM ${this.tokensTable} WHERE expires <= NOW() ORDER BY expires ASC LIMIT ${this.deleteLimit};`);
            }

            const query = new Query(config);

            // query.debug();

            query
                .then(results => {
                    if (purgeExpired) {
                        // remove the DELETE result
                        results.pop();
                    }

                    return results;
                })
                .then(resolve, reject);

            this.db.exec(query);
        });
    }

    generate (text, salt) {
        if (!text) {
            text = crypto.randomBytes(256);
        }

        if (salt) {
            text = text + salt;
        }

        const sha1 = crypto.createHash('sha1');

        sha1.update(text);

        return sha1.digest('hex');
    }
}

module.exports = Base;
