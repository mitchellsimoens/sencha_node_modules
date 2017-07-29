const { Batch } = require('@extjs/sencha-mysql');

const Base    = require('./Base');
const Manager = require('./Manager');

class Permission extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isPermission
                 */
                isPermission : true
            }
        };
    }

    static getForTeam (info) {
        return new Promise((resolve, reject) => {
            if (info.id && info.userid) {
                const {
                    batch = new Batch(),
                    connection
                } = info;

                Manager
                    .instantiateOperation('permission.team.get')
                    .get(info.id, info.userid, batch)
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('id and userid are required parameters'));
            }
        });
    }

    static getForFiddle (info) {
        return new Promise((resolve, reject) => {
            if (info.id && info.userid) {
                const {
                    batch = new Batch(),
                    connection
                } = info;

                Manager
                    .instantiateOperation('permission.fiddle.get')
                    .get(info.id, info.userid, batch)
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('id and userid are required parameters'));
            }
        });
    }
}

module.exports = Permission;
