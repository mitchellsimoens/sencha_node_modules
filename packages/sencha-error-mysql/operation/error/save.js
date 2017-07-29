const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * @class Sencha.error.mysql.operation.Error.get
 * @extends Sencha.core.Base
 *
 * A class to manage all SAVE operations for an error.
 */
class ErrorSave extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isErrorSaver
                 */
                isErrorSaver : true
            }
        };
    }

    save (Error, batch) {
        return new Promise((resolve, reject) => {
            const query   = new Query({
                inserts : [ this.$parse(Error) ],
                sqls    : [
                    `INSERT INTO app_error SET ?;`, // eslint-disable-line array-element-newline
                    `SET @error_id = LAST_INSERT_ID();`
                ]
            });

            batch.add(query);

            query.then(resolve).catch(reject);
        });
    }

    $parse (Error) {
        const {
            app,
            date,
            error,
            user,
            error : {
                meta : ErrorMeta
            }
        } = Error;

        return {
            apiKey       : app.key,
            appVersion   : app.version,
            column       : ErrorMeta ? ErrorMeta.column : null,
            date         : new Date(date),
            fileName     : ErrorMeta ? ErrorMeta.file : null,
            line         : ErrorMeta ? ErrorMeta.line : null,
            message      : error.message,
            name         : error.name,
            sourceClass  : ErrorMeta ? ErrorMeta.sourceClass  : null,
            sourceMethod : ErrorMeta ? ErrorMeta.sourceMethod : null,
            stack        : Array.isArray(error.stack) ? error.stack.join('\n') : error.stack,
            userid       : user ? user.id || 0 : 0
        };
    }
}

module.exports = ErrorSave;
