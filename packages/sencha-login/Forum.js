const { Base } = require('@extjs/sencha-core');

const { Manager, combiner : { Combiner } } = require('./');

const crypto = require('crypto');

class Forum extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isForumUser
                 */
                isForumUser : true
            }
        };
    }

    static load (info) {
        return new Promise((resolve, reject) => {
            if (info) {
                const identifier = info.userid || info.username || info.email;

                if (identifier) {
                    const { batch, connection } = info;
                    const combiner              = new Combiner();
                    const get                   = Manager.instantiateOperation('forum.get');

                    combiner.add('data', get.getById(identifier, batch));

                    combiner
                        .then(data => new this(data))
                        .then(resolve, reject);

                    if (connection) {
                        connection.exec(batch);
                    }
                } else {
                    reject(new Error('No "userid", "username" or "email" to load with'));
                }
            } else {
                reject(new Error('No info to load with'));
            }
        });
    }

    static checkPassword (info) {
        return new Promise((resolve, reject) => {
            if (info) {
                const identifier = info.userid || info.username || info.email;

                if (identifier && info.password) {
                    const { batch, connection } = info;
                    const get                   = Manager.instantiateOperation('forum.get');

                    get
                        .checkPassword(identifier, info.password, batch)
                        .then(resolve, reject);

                    if (connection) {
                        connection.exec(batch);
                    }
                } else {
                    reject(new Error('No "userid", "username" or "email" and "password" to check with'));
                }
            } else {
                reject(new Error('No info to check with'));
            }
        });
    }

    /**
     * Generate the password to save as the `bb_password` cookie to enable remember me
     * with the `bb_userid` cookie.
     *
     * @param {String} password The password from the `user` table.
     * @param {String} [salt] The cookie salt to add to the password to encrypt. This seems
     * to be a static in vBulletin.
     * @return {String}
     */
    static encryptPasswordForCookie (password, salt = 'yKrQYTaQhmGbzEmNYPkdRX6FTojM') {
        if (!password) {
            throw new Error('A password was not provided');
        }

        return crypto
            .createHash('md5')
            .update(password + salt)
            .digest('hex');
    }

    save (info) {
        return new Promise((resolve, reject) => {
            if (info) {
                const { data } = this;

                if (data && data.userid) {
                    const { batch, connection } = info;
                    const save                  = Manager.instantiateOperation('forum.save');

                    save
                        .save(data.userid, data, batch)
                        .then(resolve, reject);

                    if (connection) {
                        connection.exec(batch);
                    }
                } else {
                    reject(new Error('No "userid" to save with'));
                }
            } else {
                reject(new Error('No info to save with'));
            }
        });
    }
}

module.exports = Forum;
