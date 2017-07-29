const { Base } = require('@extjs/sencha-core');

const { Manager, combiner : { Combiner } } = require('./');

class Sencha extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isSenchaUser
                 */
                isSenchaUser : true
            }
        };
    }

    static load (info) {
        return new Promise((resolve, reject) => {
            if (info) {
                const identifier = info.uid || info.email || info.auth_data;

                if (identifier) {
                    const { batch, connection } = info;
                    const combiner              = new Combiner();
                    const get                   = Manager.instantiateOperation('sencha.get');

                    combiner.add('data', get.getById(identifier, batch));

                    combiner
                        .then(data => new this(data))
                        .then(resolve, reject);

                    if (connection) {
                        connection.exec(batch);
                    }
                } else {
                    reject(new Error('No "uid" or "email" to load with'));
                }
            } else {
                reject(new Error('No info to load with'));
            }
        });
    }

    static checkPassword (info) {
        return new Promise((resolve, reject) => {
            if (info) {
                const identifier = info.uid || info.email;

                if (identifier && info.password) {
                    const { batch, connection } = info;
                    const get                   = Manager.instantiateOperation('sencha.get');

                    get
                        .checkPassword(identifier, info.password, batch)
                        .then(resolve, reject);

                    if (connection) {
                        connection.exec(batch);
                    }
                } else {
                    reject(new Error('No "uid" or "email" and "password" to check with'));
                }
            } else {
                reject(new Error('No info to check with'));
            }
        });
    }

    save (info) {
        return new Promise((resolve, reject) => {
            if (info) {
                const { data } = this;

                if (data && data.uid) {
                    const { batch, connection } = info;
                    const save                  = Manager.instantiateOperation('sencha.save');

                    save
                        .save(data.uid, data, batch)
                        .then(resolve, reject);

                    if (connection) {
                        connection.exec(batch);
                    }
                } else {
                    reject(new Error('No "uid" to save with'));
                }
            } else {
                reject(new Error('No info to save with'));
            }
        });
    }
}

module.exports = Sencha;
