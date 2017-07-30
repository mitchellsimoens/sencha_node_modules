const { Base, Deferrable } = require('@extjs/sencha-core');

const mysql = require('mysql');

/**
 * @class Sencha.mysql.Query
 * @extends Sencha.core.Base
 *
 * A class that will manage individual queries.
 */

class Query extends Base {
    static get meta () {
        return {
            mixins : [
                Deferrable
            ],

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isMySQLQuery
                 */
                isMySQLQuery : true

                /**
                 * @cfg {Array} inserts The insert parameters to apply
                 * onto the sql statement(s).
                 */

                /**
                 * @cfg {String/Array} sqls The sql statement(s). If a
                 * String, will be cast to an Array.
                 */
            }
        };
    }

    get logger () {
        return this._logger || console;
    }

    set logger (logger) {
        this._logger = logger;
    }

    /**
     * @property {Number} count The number of sql statements attached to this query instance.
     */
    get count () {
        return this.sqls.length;
    }

    /**
     * @property {String} sqlsSerialized The sql statements as a string.
     */
    get sqlsSerialized () {
        return this.sqls.join('');
    }

    /**
     * @property {Array} insertsSerialized The insert parameters that will be applied onto the
     * sql statements.
     */
    get insertsSerialized () {
        return this.inserts || [];
    }

    get sqls () {
        return this._sqls || [];
    }

    set sqls (sqls) {
        if (sqls) {
            if (!Array.isArray(sqls)) {
                sqls = [ sqls ];
            }
        } else {
            sqls = [];
        }

        this._sqls = sqls;
    }

    debug () {
        const { logger } = this;

        logger.log(' ');
        logger.log(' == MYSQL QUERY DEBUG ==');

        logger.log(
            mysql
                .format(this.sqlsSerialized, this.insertsSerialized)
                .split(';')
                .join(';\n')
        );

        logger.log(' == MYSQL QUERY DEBUG ==');
        logger.log(' ');
    }
}

module.exports = Query;
