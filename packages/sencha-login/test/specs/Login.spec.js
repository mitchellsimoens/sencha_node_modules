const { expect }          = require('chai');
const { Login, Manager }  = require('../../');
const { api : { Token } } = require('@extjs/sencha-token');

describe('Login', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Login();
        });

        it('should be a login', function () {
            expect(instance).to.have.property('isLogin', true);
        });
    });

    describe('check', function () {
        it('should not have any cookies to check', function () {
            instance = new Login();

            return instance
                .check()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No cookies to work with');
                });
        });

        it('should check if forum cookie found', function () {
            instance = new Login({
                cookies : {
                    sencha_forum_api_refresh_token : 'abcd'
                }
            });

            const stub = this.sandbox.stub(instance, 'checkSencha').resolves('foo');

            return instance
                .check()
                .then(ret => {
                    expect(ret).to.equal('foo');

                    expect(stub).to.have.been.calledOnce;
                    expect(stub).to.have.been.calledWith({
                        forum  : 'abcd',
                        sencha : undefined
                    });
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should check if sencha cookie found', function () {
            instance = new Login({
                cookies : {
                    sencha_api_refresh_token : 'edgh'
                }
            });

            const stub = this.sandbox.stub(instance, 'checkSencha').resolves('foo');

            return instance
                .check()
                .then(ret => {
                    expect(ret).to.equal('foo');

                    expect(stub).to.have.been.calledOnce;
                    expect(stub).to.have.been.calledWith({
                        forum  : undefined,
                        sencha : 'edgh'
                    });
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should check if vbulletin cookie found', function () {
            instance = new Login({
                cookies : {
                    bb_password : 'mypassword',
                    bb_userid   : 1234
                }
            });

            const stub = this.sandbox.stub(instance, 'checkSencha').resolves('foo');

            return instance
                .check()
                .then(ret => {
                    expect(ret).to.equal('foo');

                    expect(stub).to.have.been.calledOnce;
                    expect(stub).to.have.been.calledWith({
                        forum     : undefined,
                        sencha    : undefined,
                        vbulletin : {
                            bb_password : 'mypassword',
                            bb_userid   : 1234
                        }
                    });
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('findCookies', function () {
        it('should return undefined if no cookies', function () {
            instance = new Login();

            const result = instance.findCookies();

            expect(result).to.be.undefined;
        });

        it('should find forum cookie', function () {
            instance = new Login({
                cookies : {
                    sencha_forum_api_refresh_token : 'abcd'
                }
            });

            const result = instance.findCookies();

            expect(result).to.be.an('object');
            expect(result).to.have.property('forum', 'abcd');
            expect(result).to.have.property('sencha', undefined);
        });

        it('should find sencha cookie', function () {
            instance = new Login({
                cookies : {
                    sencha_api_refresh_token : 'efgh'
                }
            });

            const result = instance.findCookies();

            expect(result).to.be.an('object');
            expect(result).to.have.property('forum',  undefined);
            expect(result).to.have.property('sencha', 'efgh');
        });

        it('should find sencha cookie', function () {
            instance = new Login({
                cookies : {
                    bb_password : 'mypassword',
                    bb_userid   : 1234
                }
            });

            const result = instance.findCookies();

            expect(result).to.be.an('object');
            expect(result).to.have.property('forum',  undefined);
            expect(result).to.have.property('sencha', undefined);

            expect(result).to.have.property('vbulletin');
            expect(result.vbulletin).to.be.an('object');
            expect(result).to.have.deep.property('vbulletin.bb_password', 'mypassword');
            expect(result).to.have.deep.property('vbulletin.bb_userid', 1234);
        });

        it('should ignore vbulletin if only one cookie exists', function () {
            instance = new Login({
                cookies : {
                    bb_userid : 1234
                }
            });

            const result = instance.findCookies();

            expect(result).to.be.an('object');
            expect(result).to.have.property('forum',  undefined);
            expect(result).to.have.property('sencha', undefined);

            expect(result).to.not.have.property('vbulletin');
        });
    });

    describe('checkSencha', function () {
        beforeEach(function () {
            instance = new Login();
        });

        it('should reject if no cookies passed', function () {
            return instance
                .checkSencha()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No cookies provided');
                });
        });

        it('should reject if no cookies available', function () {
            return instance
                .checkSencha({})
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No cookies available');
                });
        });

        describe('has sencha', function () {
            it('should build forum from sencha', function () {
                const stub = this.sandbox.stub(instance, 'buildForumFromSencha').resolves('good');

                const cookies = {
                    sencha : 'abcd'
                };

                return instance
                    .checkSencha(cookies)
                    .then(result => {
                        expect(result).to.equal('good');

                        expect(stub).to.have.been.calledOnce;
                        expect(stub).to.have.been.calledWith({ sencha : 'abcd' });
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });

            it('should build vbulletin from sencha', function () {
                const stub = this.sandbox.stub(instance, 'buildVBulletinFromForum').resolves('good');

                const cookies = {
                    forum  : 'efgh',
                    sencha : 'abcd'
                };

                return instance
                    .checkSencha(cookies)
                    .then(result => {
                        expect(result).to.equal('good');

                        expect(stub).to.have.been.calledOnce;
                        expect(stub).to.have.been.calledWith({ forum : 'efgh', sencha : 'abcd' });
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });

            it('should have all cookies', function () {
                const cookies = {
                    forum     : 'efgh',
                    sencha    : 'abcd',
                    vbulletin : {
                        bb_password : 'somepassword',
                        bb_userid   : 1234
                    }
                };

                return instance
                    .checkSencha(cookies)
                    .then(result => {
                        expect(result).to.have.property('forum',  'efgh');
                        expect(result).to.have.property('sencha', 'abcd');

                        expect(result).to.have.deep.property('vbulletin.bb_password', 'somepassword');
                        expect(result).to.have.deep.property('vbulletin.bb_userid',   1234);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });
        });

        describe('has forum', function () {
            it('should build sencha', function () {
                const stub = this.sandbox.stub(instance, 'buildSenchaFromForum').resolves('good');

                const cookies = {
                    forum : 'efgh'
                };

                return instance
                    .checkSencha(cookies)
                    .then(result => {
                        expect(result).to.equal('good');

                        expect(stub).to.have.been.calledOnce;
                        expect(stub).to.have.been.calledWith({ forum : 'efgh' });
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });
        });

        describe('has vbulletin', function () {
            it('should build forum and sencha', function () {
                const forum  = this.sandbox.stub(instance, 'buildForumFromVBulletin').resolves('good');
                const sencha = this.sandbox.stub(instance, 'buildSenchaFromVBulletin').resolves('good');

                const cookies = {
                    vbulletin : {
                        bb_password : 'somepassword',
                        bb_userid   : 1234
                    }
                };

                return instance
                    .checkSencha(cookies)
                    .then(result => {
                        expect(result).to.equal('good');

                        expect(forum).to.have.been.calledOnce;
                        expect(forum).to.have.been.calledWith({
                            vbulletin : {
                                bb_password : 'somepassword',
                                bb_userid   : 1234
                            }
                        });

                        expect(sencha).to.have.been.calledOnce;
                        expect(sencha).to.have.been.calledWith('good');
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });
        });
    });

    describe('buildSenchaFromForum', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should build forum from sencha', function () {
            const cookies = {
                forum     : 'abcd',
                vbulletin : {
                    bb_password : 'mypassword',
                    bb_userid   : 1234
                }
            }

            const getForumByToken = this.sandbox.stub().resolves({ userid : 1234 });
            const instantiateOp   = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getForumByToken
            });
            const exec = this.sandbox.stub();

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            instance = new Login({
                connection : {
                    login : {
                        exec
                    }
                }
            });

            return instance
                .buildSenchaFromForum(cookies)
                .then(result => {
                    expect(result).to.be.an('object');

                    expect(result).to.have.property('forum', 'abcd');

                    expect(result).to.have.property('sencha');
                    expect(result).to.have.deep.property('sencha.access.token',  'access-token');
                    expect(result).to.have.deep.property('sencha.access.type',   'access');
                    expect(result).to.have.deep.property('sencha.refresh.token', 'refresh-token');
                    expect(result).to.have.deep.property('sencha.refresh.type',  'refresh');

                    expect(instantiateOp).to.have.been.calledOnce;
                    expect(instantiateOp).to.have.been.calledWith('login.get');

                    expect(getForumByToken).to.have.been.calledOnce;
                    expect(getForumByToken).to.have.been.calledWith('abcd');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should build forum and vbulletin from sencha', function () {
            const cookies = {
                forum : 'abcd'
            }

            const getForumByToken = this.sandbox.stub().resolves({ password: 'somepassword', userid : 1234 });
            const instantiateOp   = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getForumByToken
            });
            const exec = this.sandbox.stub();

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            instance = new Login({
                connection : {
                    login : {
                        exec
                    }
                }
            });

            return instance
                .buildSenchaFromForum(cookies)
                .then(result => {
                    expect(result).to.be.an('object');

                    expect(result).to.have.property('forum', 'abcd');

                    expect(result).to.have.property('sencha');
                    expect(result).to.have.deep.property('sencha.access.token',  'access-token');
                    expect(result).to.have.deep.property('sencha.access.type',   'access');
                    expect(result).to.have.deep.property('sencha.refresh.token', 'refresh-token');
                    expect(result).to.have.deep.property('sencha.refresh.type',  'refresh');

                    expect(result).to.have.property('vbulletin');
                    expect(result).to.have.deep.property('vbulletin.bb_password', 'b2a4ff5b5b540519212b9ad92fe5ee12');

                    expect(instantiateOp).to.have.been.calledOnce;
                    expect(instantiateOp).to.have.been.calledWith('login.get');

                    expect(getForumByToken).to.have.been.calledOnce;
                    expect(getForumByToken).to.have.been.calledWith('abcd');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('createSenchaFromForum', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should create sencha from forum', function () {
            instance = new Login();

            const cookies = {};
            const forum   = {
                scopes : 'foo,bar',
                uid    : 1234
            };

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            return instance
                .createSenchaFromForum(cookies, forum)
                .then(cookies => {
                    expect(cookies.sencha).to.be.an('object');

                    expect(cookies).to.have.deep.property('sencha.access.token',  'access-token');
                    expect(cookies).to.have.deep.property('sencha.access.type',   'access');
                    expect(cookies).to.have.deep.property('sencha.refresh.token', 'refresh-token');
                    expect(cookies).to.have.deep.property('sencha.refresh.type',  'refresh');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should create sencha from forum with no scopes', function () {
            instance = new Login();

            const cookies = {};
            const forum   = {
                uid : 1234
            };

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            return instance
                .createSenchaFromForum(cookies, forum)
                .then(cookies => {
                    expect(cookies.sencha).to.be.an('object');

                    expect(cookies).to.have.deep.property('sencha.access.token',  'access-token');
                    expect(cookies).to.have.deep.property('sencha.access.type',   'access');
                    expect(cookies).to.have.deep.property('sencha.refresh.token', 'refresh-token');
                    expect(cookies).to.have.deep.property('sencha.refresh.type',  'refresh');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('buildForumFromSencha', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should build forum from sencha', function () {
            const cookies = {
                sencha    : 'abcd',
                vbulletin : {
                    bb_password : 'mypassword',
                    bb_userid   : 1234
                }
            }

            const getSenchaByToken = this.sandbox.stub().resolves({ userid : 1234 });
            const instantiateOp    = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getSenchaByToken
            });
            const exec = this.sandbox.stub();

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            instance = new Login({
                connection : {
                    login : {
                        exec
                    }
                }
            });

            return instance
                .buildForumFromSencha(cookies)
                .then(result => {
                    expect(result).to.be.an('object');

                    expect(result).to.have.property('sencha', 'abcd');

                    expect(result).to.have.property('forum');
                    expect(result).to.have.deep.property('forum.access.token',  'access-token');
                    expect(result).to.have.deep.property('forum.access.type',   'access');
                    expect(result).to.have.deep.property('forum.refresh.token', 'refresh-token');
                    expect(result).to.have.deep.property('forum.refresh.type',  'refresh');

                    expect(instantiateOp).to.have.been.calledOnce;
                    expect(instantiateOp).to.have.been.calledWith('login.get');

                    expect(getSenchaByToken).to.have.been.calledOnce;
                    expect(getSenchaByToken).to.have.been.calledWith('abcd');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should build forum and vbulletin from sencha', function () {
            const cookies = {
                sencha : 'abcd'
            }

            const getSenchaByToken = this.sandbox.stub().resolves({ password: 'somepassword', userid : 1234 });
            const instantiateOp    = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getSenchaByToken
            });
            const exec = this.sandbox.stub();

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            instance = new Login({
                connection : {
                    login : {
                        exec
                    }
                }
            });

            return instance
                .buildForumFromSencha(cookies)
                .then(result => {
                    expect(result).to.be.an('object');

                    expect(result).to.have.property('sencha', 'abcd');

                    expect(result).to.have.property('forum');
                    expect(result).to.have.deep.property('forum.access.token',  'access-token');
                    expect(result).to.have.deep.property('forum.access.type',   'access');
                    expect(result).to.have.deep.property('forum.refresh.token', 'refresh-token');
                    expect(result).to.have.deep.property('forum.refresh.type',  'refresh');

                    expect(result).to.have.property('vbulletin');
                    expect(result).to.have.deep.property('vbulletin.bb_password', 'b2a4ff5b5b540519212b9ad92fe5ee12');

                    expect(instantiateOp).to.have.been.calledOnce;
                    expect(instantiateOp).to.have.been.calledWith('login.get');

                    expect(getSenchaByToken).to.have.been.calledOnce;
                    expect(getSenchaByToken).to.have.been.calledWith('abcd');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('createForumFromSencha', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should create forum from sencha', function () {
            instance = new Login();

            const cookies = {};
            const sencha  = {
                scopes : 'foo,bar',
                uid    : 1234
            };

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            return instance
                .createForumFromSencha(cookies, sencha)
                .then(cookies => {
                    expect(cookies.forum).to.be.an('object');

                    expect(cookies).to.have.deep.property('forum.access.token',  'access-token');
                    expect(cookies).to.have.deep.property('forum.access.type',   'access');
                    expect(cookies).to.have.deep.property('forum.refresh.token', 'refresh-token');
                    expect(cookies).to.have.deep.property('forum.refresh.type',  'refresh');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('buildForumFromVBulletin', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should build forum from vbulletin', function () {
            const cookies = {
                vbulletin : {
                    bb_userid : 1234
                }
            }

            const getById       = this.sandbox.stub().resolves({ userid : 1234 });
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getById
            });
            const exec = this.sandbox.stub();

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            instance = new Login({
                connection : {
                    login : {
                        exec
                    }
                }
            });

            return instance
                .buildForumFromVBulletin(cookies)
                .then(result => {
                    expect(result).to.be.an('object');

                    expect(result).to.have.property('vbulletin');
                    expect(result).to.have.deep.property('vbulletin.bb_userid',   1234);

                    expect(result).to.have.property('forum');
                    expect(result).to.have.deep.property('forum.access.token',  'access-token');
                    expect(result).to.have.deep.property('forum.access.type',   'access');
                    expect(result).to.have.deep.property('forum.refresh.token', 'refresh-token');
                    expect(result).to.have.deep.property('forum.refresh.type',  'refresh');

                    expect(instantiateOp).to.have.been.calledOnce;
                    expect(instantiateOp).to.have.been.calledWith('forum.get');

                    expect(getById).to.have.been.calledOnce;
                    expect(getById).to.have.been.calledWith(1234);

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('buildSenchaFromVBulletin', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should build sencha from vbulletin', function () {
            const cookies = {
                vbulletin : {
                    bb_userid : 1234
                }
            }

            const getSenchaFromForum = this.sandbox.stub().resolves({ userid : 1234 });
            const instantiateOp      = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getSenchaFromForum
            });
            const exec = this.sandbox.stub();

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            instance = new Login({
                connection : {
                    login : {
                        exec
                    }
                }
            });

            return instance
                .buildSenchaFromVBulletin(cookies)
                .then(result => {
                    expect(result).to.be.an('object');

                    expect(result).to.have.property('vbulletin');
                    expect(result).to.have.deep.property('vbulletin.bb_userid',   1234);

                    expect(result).to.have.property('sencha');
                    expect(result).to.have.deep.property('sencha.access.token',  'access-token');
                    expect(result).to.have.deep.property('sencha.access.type',   'access');
                    expect(result).to.have.deep.property('sencha.refresh.token', 'refresh-token');
                    expect(result).to.have.deep.property('sencha.refresh.type',  'refresh');

                    expect(instantiateOp).to.have.been.calledOnce;
                    expect(instantiateOp).to.have.been.calledWith('login.get');

                    expect(getSenchaFromForum).to.have.been.calledOnce;
                    expect(getSenchaFromForum).to.have.been.calledWith(1234);

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('createForumFromVBulletin', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should create forum token', function () {
            instance = new Login();

            const cookies = {};
            const forum   = {
                userid : 1234
            };

            const stub = this.sandbox.stub(Token, 'createToken').resolves([
                { type : 'refresh', token : 'refresh-token' },
                { type : 'access',  token : 'access-token'  }
            ]);

            return instance
                .createForumFromVBulletin(cookies, forum)
                .then(cookies => {
                    expect(cookies.forum).to.be.an('object');

                    expect(cookies).to.have.deep.property('forum.access.token',  'access-token');
                    expect(cookies).to.have.deep.property('forum.access.type',   'access');
                    expect(cookies).to.have.deep.property('forum.refresh.token', 'refresh-token');
                    expect(cookies).to.have.deep.property('forum.refresh.type',  'refresh');

                    expect(stub).to.have.been.calledOnce;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('buildVBulletinFromForum', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter();
        });

        afterEach(function () {
            delete Manager.adapter;
        });

        it('should create vbulletin with existing forum data', function () {
            instance = new Login();

            const cookies = {};
            const forum   = {
                password : 'somehashedpassword',
                userid   : 1234
            };

            const result  = instance.buildVBulletinFromForum(cookies, forum);

            expect(result).to.be.an('object');
            expect(result).to.equal(cookies)
            expect(result).to.have.property('vbulletin');

            expect(result).to.have.deep.property('vbulletin.expiration');
            expect(result).to.have.deep.property('vbulletin.bb_password', '49e3a750d7861fc09fbe7593137439bc');
            expect(result).to.have.deep.property('vbulletin.bb_userid',   1234);
        });

        it('should lookup forum by token and create vbulletin', function () {
            const cookies = {
                forum : 'abcd'
            }

            const getForumByToken = this.sandbox.stub().resolves({ password: 'somehashedpassword', userid : 1234 });
            const instantiateOp   = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getForumByToken
            });
            const exec = this.sandbox.stub();

            instance = new Login({
                connection : {
                    login : {
                        exec
                    }
                }
            });

            return instance
                .buildVBulletinFromForum(cookies)
                .then(result => {
                    expect(result).to.be.an('object');
                    expect(result).to.have.property('vbulletin');

                    expect(result).to.have.deep.property('vbulletin.expiration');
                    expect(result).to.have.deep.property('vbulletin.bb_password', '49e3a750d7861fc09fbe7593137439bc');
                    expect(result).to.have.deep.property('vbulletin.bb_userid',   1234);

                    expect(instantiateOp).to.have.been.calledOnce;
                    expect(instantiateOp).to.have.been.calledWith('login.get');

                    expect(getForumByToken).to.have.been.calledOnce;
                    expect(getForumByToken).to.have.been.calledWith('abcd');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });
});
