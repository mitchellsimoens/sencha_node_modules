const { Base } = require('@extjs/sencha-core');
const request  = require('request');

class Cdn extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isCdn
                 */
                isCdn : true,

                /**
                 * @cfg {Number} tte Time-to-expire, the amount of time
                 * till the token will expire in number of milliseconds.
                 */
                tte : 5 * 60000 // 5 minutes
            }
        };
    }

    get expiration () {
        return new Date(new Date().getTime() + this.tte);
    }

    retrieve (user, path) {
        return new Promise((resolve, reject) => {
            const { key, url } = this;

            if (!url) {
                reject(new Error('`url` is required'));
            } else if (key) {
                const form = this.$buildForm({
                    path,
                    user
                });

                request.post(
                    {
                        form,
                        url
                    },
                    (error, response, body) => {
                        if (error) {
                            reject(error);
                        } else {
                            try {
                                body = JSON.parse(body);

                                resolve({
                                    data    : body.token,
                                    success : true
                                });
                            } catch (e) {
                                reject(new Error('A token could not be retrieved'));
                            }
                        }
                    }
                );
            } else {
                reject(new Error('`key` is required'));
            }
        });
    }

    $buildForm ({ user, key = this.key, path = '/*' }) {
        const form = {
            a : key,
            s : true,
            u : path
        };

        if (user && !user.isGuest) {
            form.e = user.email;
        }

        return form;
    }
}

module.exports = Cdn;
