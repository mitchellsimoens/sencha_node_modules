const { Base } = require('@extjs/sencha-core');

/**
 * @class Sencha.mysql.Batch
 * @extends Sencha.core.Base
 *
 * This class will hold several {@link Sencha.mysql.Query} instances
 * when the associated connection is suspended. When the MySQL returns
 * a response, this will split the results up and pass to the individual
 * {@link Sencha.mysql.Query} instances.
 */

class Batch extends Base {
    static get meta () {
        return {
            mixins : [
                '@extjs/sencha-core/Deferrable'
            ],

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isMySQLBatch
                 */
                isMySQLBatch : true

                /**
                 * @property {Array} queries An array of attached
                 * {@link Sencha.mysql.Query} instances.
                 */
            }
        };
    }

    ctor () {
        if (!this.queries) {
            this.queries = [];
        }
    }

    dtor () {
        this.queries = null;
    }

    /**
     * @property {Number} count The number of attached {@link Sencha.mysql.Query}
     * instances.
     */
    get count () {
        return this.queries.length;
    }

    /**
     * @property {Array} insertsSerialized The concatenated insert parameters
     * to pass to the mysql module to apply onto the MySQL statements.
     */
    get insertsSerialized () {
        let inserts = [];

        this.queries.forEach(query => {
            const serialized = query.insertsSerialized;

            if (serialized && serialized.length) {
                inserts = inserts.concat(serialized);
            }
        });

        return inserts;
    }

    /**
     * @property {String} sqlsSerialized The concatenated MySQL queries
     * from the attached {@link Sencha.mysql.Query} instances.
     */
    get sqlsSerialized () {
        return this.queries
            .map(
                query => query.sqlsSerialized
            )
            .join('');
    }

    /**
     * @param {Sencha.mysql.Query[]} query The query (or array of queries) to add
     * to this batch.
     */
    add (query) {
        if (Array.isArray(query)) {
            query.forEach((item) => this.add(item));
        } else {
            this.queries.push(query);
        }
    }

    /**
     * @param {Array/Object} results The raw results from the mysql module.
     */
    onResolve (results) {
        const count = this.queries.length;

        this.queries.forEach(query => {
            let result = count === 1 ? results : results.splice(0, query.count);

            if (count > 1 && Array.isArray(result) && result.length === 1) {
                /**
                 * If there are more than 1 queries connected to this batch
                 * and the result is an array with one item, return only
                 * that one item.
                 */
                result = result[ 0 ]; // eslint-disable-line prefer-destructuring
            }

            query.resolve(result);
        });
    }

    /**
     * @param {Error} error The error returned by the mysql module.
     * This will not rollback any other sqls so some may have succeeded.
     */
    onReject (error) {
        this.queries.forEach(query => query.reject(error));
    }
}

module.exports = Batch;
