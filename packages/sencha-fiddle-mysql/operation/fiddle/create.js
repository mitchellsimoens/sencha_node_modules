const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.fiddle.mysql.operation.Fiddle.create
 * @extends Sencha.core.Base
 *
 * A class to manage all CREATE operations for fiddle assets.
 */
class Fiddle extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFiddleCreator
                 */
                isFiddleCreator : true
            }
        };
    }

    create (data, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [
                data.forkid,
                data.userid,
                data.username,
                data.frameworkid,
                data.frameworkVersion,
                data.title,
                data.description,
                data.index,
                data.password ? data.password : '',
                data.rtl,
                data.version || 2
            ];
            const query   = new Query({
                inserts,
                sqls : [
                    `INSERT INTO fiddles
(\`forkid\`, \`userid\`, \`username\`, \`frameworkid\`, \`frameworkVersion\`, \`createdDate\`, \`modifiedDate\`, \`title\`, \`description\`, \`index\`, \`password\`, \`rtl\`, \`version\`)
SELECT ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ? FROM (SELECT 1) temp WHERE @permission > 1;`,
                    `SET @fiddleid = LAST_INSERT_ID();`
                ]
            });

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Creates a temporary fiddle adding the assets and mock data
     * to the temporary assets table. This will also delete 50 rows
     * from the temporary assets table.
     * @param {Object} data
     * @param {Array} data.assets The array of assets for the fiddle.
     * @param {Array} data.mockdata The array of mock data for the fiddle.
     * @param {Object} session
     * @param {String} session.id The session id.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    temp (data, session, batch) {
        return new Promise((resolve, reject) => {
            const { assets, framework, mockdata } = data;

            const now          = new Date();
            const isDescriptor = typeof framework === 'object';
            const inserts      = [ session.id ];
            const sqls         = [
                'DELETE FROM fiddle_assets_temp WHERE sessionid = ?;', // eslint-disable-line array-element-newline
                'DELETE FROM fiddle_assets_temp WHERE created <= DATE_SUB(NOW(), INTERVAL 12 HOUR) LIMIT 50;' // TODO make configurable
            ];
            const query        = new Query({
                inserts,
                sqls
            });

            if (Array.isArray(assets)) {
                for (const asset of assets) {
                    if (isDescriptor) {
                        const wheres = [];

                        if (framework.framework) {
                            inserts.push(framework.framework);
                            wheres.push('fiddle_catalog.framework = ?');
                        }

                        if (framework.theme) {
                            inserts.push(framework.theme);
                            wheres.push('fiddle_catalog.theme = ?');
                        }

                        if (framework.toolkit) {
                            inserts.push(framework.toolkit);
                            wheres.push('fiddle_catalog.toolkit = ?');
                        }

                        if (framework.version) {
                            inserts.push(framework.version);
                            wheres.push(`LEFT(fiddle_catalog.version, ${framework.version.length}) = ?`);
                        }

                        sqls.push(`
                            INSERT INTO fiddle_assets_temp
                            SET
                                extWrap = (SELECT extWrap FROM fiddle_catalog WHERE ${wheres.join(' AND ')} ORDER BY version DESC LIMIT 1),
                                sessionid = ?,
                                created = NOW(),
                                type = ?,
                                url = ?,
                                code = ?,
                                remote = ?;
                        `);

                        inserts.push(session.id, asset.type, asset.name, asset.code, asset.remote);
                    } else {
                        sqls.push('INSERT INTO fiddle_assets_temp SET sessionid = ?, created = NOW(), type = ?, url = ?, code = ?, remote = ?, extWrap = (SELECT extWrap FROM fiddle_catalog WHERE id = ? ORDER BY version DESC LIMIT 1);');

                        inserts.push(session.id, asset.type, asset.name, asset.code, asset.remote, data.framework);
                    }
                }
            }

            if (Array.isArray(mockdata)) {
                for (const asset of mockdata) {
                    if (asset.type === 'direct') {
                        this._parseDirect(session.id, now, asset.children, null, (item) => {
                            sqls.push('INSERT INTO fiddle_assets_temp SET ?;');

                            inserts.push(item);
                        });
                    } else {
                        sqls.push('INSERT INTO fiddle_assets_temp SET ?;');

                        inserts.push({
                            code       : asset.code,
                            created    : now,
                            delay      : asset.delay,
                            dynamic    : asset.dynamic,
                            sessionid  : session.id,
                            statusCode : asset.statusCode,
                            type       : asset.type,
                            url        : asset.url
                        });
                    }
                }
            }

            batch.add(query);

            query.then(resolve, reject);
        });
    }

    /**
     * Parses the `Ext.Direct` assets as they may be in a tree structure.
     * @private
     * @param {String} sessionid The session id.
     * @param {Date} created The date to set the asset created at.
     * @param {Object} data The asset's data.
     * @param {String} root The ending name of the asset.
     * @param {Function} fn The function to execute for each leaf item.
     */
    _parseDirect (sessionid, created, data, root, fn) {
        if (data.type === 'direct') {
            // is the "leaf" object
            fn({
                created,
                sessionid,
                code        : data.code, // eslint-disable-line sort-keys
                delay       : data.delay,
                direct_args : Array.isArray(data.direct_args) && data.direct_args.length ? data.direct_args.join() : null, // eslint-disable-line camelcase
                direct_len  : data.direct_len, // eslint-disable-line camelcase
                dynamic     : data.dynamic,
                formHandler : data.formHandler,
                statusCode  : data.statusCode,
                type        : data.type,
                url         : root
            });
        } else {
            for (const key in data) {
                const thisRoot = root ? `${root}.${key}` : key;

                this._parseDirect(sessionid, created, data[ key ], thisRoot, fn);
            }
        }
    }
}

module.exports = Fiddle;
