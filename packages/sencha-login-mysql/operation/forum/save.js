const { Base }  = require('@extjs/sencha-core');
const { Query } = require('@extjs/sencha-mysql');

/**
 * Only the fields that this operation can handle.
 * If more are needed, use the `@extjs/sencha-vbulletin`
 * module.
 */
const userProperties = [
    'displaygroupid',
    'email',
    'membergroupids',
    'username',
    'usergroupid'
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
 * @class Sencha.login.mysql.operation.Forum.save
 * @extends Sencha.core.Base
 *
 * A class to manage all SAVE operations for forum user resources.
 */
class Sencha extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isForumSaver
                 */
                isForumSaver : true
            }
        };
    }

    /**
     * Retrieves the user information.
     * @param {Number} userid The user id lookup the user.
     * @param {Object} data The data to save with
     * @param {Sencha.mysql.Batch} batch The batch to add queries to.
     * @return {Promise}
     */
    save (userid, data, batch) {
        const query = new Query({
            inserts : [ cleanseData(data), userid ],
            sqls    : `UPDATE user
                SET ?
            WHERE user.userid = ?;`
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
