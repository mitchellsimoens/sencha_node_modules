const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

function onLoad (result) {
    if (Array.isArray(result)) {
        [ result ] = result;
    }

    if (result) {
        if (typeof result.codeWrap === 'string' && result.codeWrap) {
            result.codeWrap = JSON.parse(result.codeWrap);
        }
    }

    return result;
}

/**
 * @class Sencha.fiddle.mysql.operation.Framework.get
 * @extends Sencha.core.Base
 *
 * A class to manage all GET operations for frameworks.
 */
class Framework extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isFrameworkGetter
                 */
                isFrameworkGetter : true
            }
        };
    }

    /**
     * Retrieves the framework by an id
     * @param {Number/Object} descriptor If a Number, the framework will be loaded using
     * an id. If an object, the framework will be loaded from the descriptor. A descriptor
     * can use `framework`, `theme`, `toolkit` and/or `version` to describe what
     * framework should be used. Each of the descriptors are optional but at least one
     * should be used.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getById (descriptor, batch) {
        return new Promise((resolve, reject) => {
            const inserts = [];
            const wheres  = [];

            if (typeof descriptor === 'object') {
                if (descriptor.framework) {
                    inserts.push(descriptor.framework);
                    wheres.push('fiddle_catalog.framework = ?');
                }

                if (descriptor.theme) {
                    inserts.push(descriptor.theme);
                    wheres.push('fiddle_catalog.theme = ?');
                }

                if (descriptor.toolkit) {
                    inserts.push(descriptor.toolkit);
                    wheres.push('fiddle_catalog.toolkit = ?');
                }

                if (descriptor.version) {
                    inserts.push(descriptor.version);
                    wheres.push(`LEFT(fiddle_catalog.version, ${descriptor.version.length}) = ?`);
                }
            } else {
                inserts.push(descriptor);
                wheres.push('fiddle_catalog.id = ?');
            }

            if (wheres.length) {
                const query = new Query({
                    inserts,
                    sqls : `SELECT fiddle_catalog.* FROM fiddle_catalog WHERE ${wheres.join(' AND ')} ORDER BY LENGTH(fiddle_catalog.version) DESC, fiddle_catalog.version DESC LIMIT 1;`
                });

                batch.add(query);

                query
                    .then(onLoad)
                    .then(resolve, reject);
            } else {
                reject(new Error('The framework descriptor does not have enough to load a framework.'));
            }
        });
    }

    /**
     * Retrieves the framework attached to a fiddle.
     * @param {Number} id The real fiddle id to retrieve the attached framework.
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    getForFiddle (id, batch) {
        return new Promise((resolve, reject) => {
            const query = new Query({
                inserts : [ id ],
                sqls    : 'SELECT fiddle_catalog.* FROM fiddle_catalog INNER JOIN fiddles ON fiddles.id = ? AND fiddles.frameworkid = fiddle_catalog.id LIMIT 1;'
            });

            batch.add(query);

            query
                .then(onLoad)
                .then(resolve, reject);
        });
    }
}

module.exports = Framework;
