const { Base }            = require('@extjs/sencha-core');
const { api : { Token } } = require('@extjs/sencha-token');
const { Forum, Manager }  = require('./');

class Login extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isLogin
                 */
                isLogin : true
            }
        };
    }

    check () {
        const found = this.findCookies();

        if (found && (found.forum || found.sencha || found.vbulletin)) {
            return this.checkSencha(found);
        } else {
            return Promise.reject(new Error('No cookies to work with'));
        }
    }

    findCookies () {
        const { cookies } = this;

        if (cookies) {
            const {
                bb_password, bb_userid, // eslint-disable-line camelcase
                sencha_api_refresh_token       : sencha,
                sencha_forum_api_refresh_token : forum
            } = cookies;

            const ret = {
                forum,
                sencha
            };

            if (bb_password && bb_userid) { // eslint-disable-line camelcase
                ret.vbulletin = {
                    bb_password, // eslint-disable-line camelcase
                    bb_userid // eslint-disable-line camelcase
                };
            }

            return ret;
        }
    }

    checkSencha (cookies) {
        return new Promise((resolve, reject) => {
            if (cookies) {
                if (cookies.sencha) {
                    if (!cookies.forum) {
                        this
                            .buildForumFromSencha(cookies)
                            .then(resolve, reject);
                    } else if (cookies.vbulletin) {
                        resolve(cookies);
                    } else {
                        this
                            .buildVBulletinFromForum(cookies)
                            .then(resolve, reject);
                    }
                } else if (cookies.forum) {
                    this
                        .buildSenchaFromForum(cookies)
                        .then(resolve, reject);
                } else if (cookies.vbulletin) {
                    this
                        .buildForumFromVBulletin(cookies)
                        .then(this.buildSenchaFromVBulletin.bind(this))
                        .then(resolve, reject);
                } else {
                    reject(new Error('No cookies available'));
                }
            } else {
                reject(new Error('No cookies provided'));
            }
        });
    }

    buildSenchaFromForum (cookies) {
        return new Promise((resolve, reject) => {
            const batch      = Manager.adapter.createBatch();
            const connection = this.connection.login;
            const get        = Manager.instantiateOperation('login.get');

            get
                .getForumByToken(cookies.forum, batch)
                .then(result => {
                    if (!cookies.vbulletin) {
                        this.buildVBulletinFromForum(cookies, result);
                    }

                    return result;
                })
                .then(this.createSenchaFromForum.bind(this, cookies))
                .then(() => resolve(cookies))
                .catch(reject);

            connection.exec(batch);
        });
    }

    createSenchaFromForum (cookies, forum) {
        return Token
            .createToken({
                batch : Manager.adapter.createBatch(),

                key    : '571923d0-c1c1-42b9-a228-7c594cbddfaf',
                scopes : forum.scopes || '',  // TODO hmmmm
                type   : [ 'access', 'refresh' ],
                userid : forum.uid
            })
            .then(tokens => {
                const access  = tokens.find(token => token.type === 'access');
                const refresh = tokens.find(token => token.type === 'refresh');

                cookies.sencha = {
                    access,
                    refresh
                };

                return cookies;
            });
    }

    buildForumFromSencha (cookies) {
        return new Promise((resolve, reject) => {
            const batch      = Manager.adapter.createBatch();
            const connection = this.connection.login;
            const get        = Manager.instantiateOperation('login.get');

            get
                .getSenchaByToken(cookies.sencha, batch)
                .then(result => {
                    if (!cookies.vbulletin) {
                        this.buildVBulletinFromForum(cookies, result);
                    }

                    return result;
                })
                .then(this.createForumFromSencha.bind(this, cookies))
                .then(() => resolve(cookies))
                .catch(reject);

            connection.exec(batch);
        });
    }

    createForumFromSencha (cookies, sencha) {
        return Token
            .createToken({
                batch : Manager.adapter.createBatch(),

                key    : '571923d0-c1c1-42b9-a228-7c594cbddfaf',
                scopes : sencha.scopes,  // TODO hmmmm
                system : 'forum',
                type   : [ 'access', 'refresh' ],
                userid : sencha.userid
            })
            .then(tokens => {
                const access  = tokens.find(token => token.type === 'access');
                const refresh = tokens.find(token => token.type === 'refresh');

                cookies.forum = {
                    access,
                    refresh
                };

                return cookies;
            });
    }

    buildForumFromVBulletin (cookies) {
        return new Promise((resolve, reject) => {
            const batch      = Manager.adapter.createBatch();
            const connection = this.connection.login;
            const get        = Manager.instantiateOperation('forum.get');

            get
                .getById(cookies.vbulletin.bb_userid, batch)
                .then(this.createForumFromVBulletin.bind(this, cookies))
                .then(() => resolve(cookies))
                .catch(reject);

            connection.exec(batch);
        });
    }

    buildSenchaFromVBulletin (cookies) {
        return new Promise((resolve, reject) => {
            const batch      = Manager.adapter.createBatch();
            const connection = this.connection.login;
            const get        = Manager.instantiateOperation('login.get');

            get
                .getSenchaFromForum(cookies.vbulletin.bb_userid, batch)
                .then(this.createSenchaFromForum.bind(this, cookies))
                .then(() => resolve(cookies))
                .catch(reject);

            connection.exec(batch);
        });
    }

    createForumFromVBulletin (cookies, forum) {
        return Token
            .createToken({
                batch : Manager.adapter.createBatch(),

                key    : '571923d0-c1c1-42b9-a228-7c594cbddfaf',
                scopes : '',  // TODO hmmmm
                system : 'forum',
                type   : [ 'access', 'refresh' ],
                userid : forum.userid
            })
            .then(tokens => {
                const access  = tokens.find(token => token.type === 'access');
                const refresh = tokens.find(token => token.type === 'refresh');

                cookies.forum = {
                    access,
                    refresh
                };

                return cookies;
            });
    }

    buildVBulletinFromForum (cookies, forum) {
        if (forum) {
            const date = new Date();

            date.setFullYear(date.getFullYear() + 1);

            cookies.vbulletin = {
                bb_password : Forum.encryptPasswordForCookie(forum.password), // eslint-disable-line camelcase
                bb_userid   : forum.userid, // eslint-disable-line camelcase
                expiration  : date
            };

            return cookies;
        } else {
            return new Promise((resolve, reject) => {
                const batch      = Manager.adapter.createBatch();
                const connection = this.connection.login;
                const get        = Manager.instantiateOperation('login.get');

                get
                    .getForumByToken(cookies.forum, batch)
                    .then(this.buildVBulletinFromForum.bind(this, cookies))
                    .then(resolve, reject);

                connection.exec(batch);
            });
        }
    }
}

module.exports = Login;
