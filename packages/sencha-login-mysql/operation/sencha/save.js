const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * Only the fields that this operation can handle.
 * If more are needed, use the `@extjs/sencha-portal`
 * module.
 */
const userProperties = [
    'auth_data',
    'display_name',
    'email',
    'user_type'
];

function cleanseData (data) {
    data = Base.merge({}, data);

    return userProperties
        .reduce((result, key) => {
            result[ key ] = data[ key ];

            return result;
        }, {});
}

/**
 * @class Sencha.login.mysql.operation.Sencha.save
 * @extends Sencha.core.Base
 *
 * A class to manage all SAVE operations for sencha user resources.
 */
class Sencha extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isSenchaSaver
                 */
                isSenchaSaver : true
            }
        };
    }

    /**
     * Retrieves the user information.
     * @param {Number} uid The user id lookup the user.
     * @param {Object} data The data to save with
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    save (uid, data, batch) {
        const query = new Query({
            inserts : [ cleanseData(data), uid ],
            sqls    : `UPDATE user
                SET ?
            WHERE user.uid = ?;`
        });

        batch.add(query);

        return query
            .then(result => {
                if (!result || !result.affectedRows) {
                    throw new Error('Could not save user');
                }

                return true;
            });
    }
}

module.exports = Sencha;
