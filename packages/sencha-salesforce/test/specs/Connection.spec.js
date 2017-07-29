const { expect }     = require('chai');
const { Connection } = require('../../');
const proxyquire     = require('proxyquire');
const { Shutdown }   = require('@extjs/sencha-node');

describe('Connection', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Connection({
                autoStart : false
            });
        });

        it('should be a connection', function () {
            expect(instance).to.have.property('isInstance',             true);
            expect(instance).to.have.property('isSalesforceConnection', true);
        });
    });

    describe('ctor', function () {
        it('should start the connection', function () {
            const loginSpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        loginSpy
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                password : 'foo',
                username : 'myusername'
            });

            expect(loginSpy).to.have.been.calledWith('myusername', 'foo');
        });

        it('should not autostart then connection', function () {
            const loginSpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        loginSpy
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'foo',
                username  : 'myusername'
            });

            expect(loginSpy).to.not.have.been.called;
        });

        it('should add a shutdown watcher', function () {
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({}),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                password : 'foo',
                username : 'myusername'
            });

            expect(Shutdown.callbacks).to.include(instance.onShutdown);
        });
    });

    describe('dtor', function () {
        it('should logout of the connection', function () {
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({}),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                password : 'foo',
                username : 'myusername'
            });

            const closeStub = this.sandbox.stub(instance, 'close').callThrough();

            instance.destroy();

            expect(closeStub).to.have.been.called;
        });

        it('should remove the shutdown watcher', function () {
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({}),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                password : 'foo',
                username : 'myusername'
            });

            instance.destroy();

            expect(Shutdown.callbacks).to.have.lengthOf(0);
        });
    });

    describe('start', function () {
        it('should login successfully', function () {
            const loginSpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        loginSpy
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                username  : 'myusername',
                password  : 'mypassword'
            });

            return instance
                .start()
                .then(() => {
                    expect(instance).to.have.property('force');
                    expect(instance).to.have.property('soap');

                    expect(loginSpy).to.have.been.calledWith('myusername', 'mypassword');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should pass loginUrl and token', function () {
            const loginSpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        loginSpy
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                loginUrl  : 'https://login',
                password  : 'mypassword',
                token     : 'abc',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(() => {
                    expect(instance).to.have.property('force');
                    expect(instance).to.have.property('soap');

                    expect(loginSpy).to.have.been.calledWith('myusername', 'mypasswordabc');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle a login error', function () {
            const loginSpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        loginSpy,
                        loginError : new Error('login failed')
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(instance).to.have.property('force', null);
                    expect(instance).to.have.property('soap',  null);
                    expect(instance).to.have.property('connError');

                    expect(loginSpy).to.have.been.calledWith('myusername', 'mypassword');

                    expect(error.message).to.equal('login failed');
                });
        });

        it('should handle a login error as a string', function () {
            const loginSpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        loginSpy,
                        loginError : 'login failed'
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(instance).to.have.property('force', null);
                    expect(instance).to.have.property('soap',  null);
                    expect(instance).to.have.property('connError');

                    expect(loginSpy).to.have.been.calledWith('myusername', 'mypassword');

                    expect(error).to.equal('login failed');
                });
        });
    });

    describe('close', function () {
        it('should logout the connection', function () {
            const logoutSpy  = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        logoutSpy
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(instance.close.bind(instance))
                .then(() => {
                    expect(instance).to.have.property('force', null);
                    expect(instance).to.have.property('soap',  null);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle logout error', function () {
            const logoutSpy  = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        logoutSpy,
                        logoutError : 'logout failed'
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(instance.close.bind(instance))
                .then(() => {
                    expect(instance).to.have.property('force', null);
                    expect(instance).to.have.property('soap',  null);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle not being logged in', function () {
            const logoutSpy  = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        logoutSpy,
                        logoutError : 'logout failed'
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .close()
                .then(() => {
                    expect(instance).to.have.property('force', null);
                    expect(instance).to.have.property('soap',  null);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('invoke', function () {
        it('should invoke soap method', function () {
            const invokeSpy  = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({}),
                    'jsforce/lib/soap' : this.createFakeSoap({
                        invokeSpy,
                        invokeResult : 'result'
                    })
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(instance.invoke.bind(instance, 'mymethod', 'myargs', 'myschema'))
                .then(result => {
                    expect(invokeSpy).to.have.been.calledWith('mymethod', 'myargs', 'myschema');

                    expect(result).to.equal('result');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle a soap error', function () {
            const invokeSpy  = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({}),
                    'jsforce/lib/soap' : this.createFakeSoap({
                        invokeSpy,
                        invokeError : 'invoke error'
                    })
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(instance.invoke.bind(instance, 'mymethod', 'myargs', 'myschema'))
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(invokeSpy).to.have.been.calledWith('mymethod', 'myargs', 'myschema');

                    expect(error).to.equal('invoke error');
                });
        });

        it('should handle not being logged in', function () {
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({}),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .invoke('mymethod', 'myargs', 'myschema')
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Soap connection not created');
                });
        });
    });

    describe('query', function () {
        it('should query soql', function () {
            const querySpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        querySpy,
                        queryResult : 'result'
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(instance.query.bind(instance, 'SELECT *'))
                .then(result => {
                    expect(querySpy).to.have.been.calledWith('SELECT *');

                    expect(result).to.equal('result');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle a query error', function () {
            const querySpy   = this.sandbox.spy();
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({
                        querySpy,
                        queryError : 'query error'
                    }),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .start()
                .then(instance.query.bind(instance, 'SELECT *'))
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(querySpy).to.have.been.calledWith('SELECT *');

                    expect(error).to.equal('query error');
                });
        });

        it('should handle not being logged in', function () {
            const Connection = proxyquire(
                '../../Connection',
                {
                    jsforce            : this.createFakeConnection({}),
                    'jsforce/lib/soap' : this.createFakeSoap({})
                }
            );

            instance = new Connection({
                autoStart : false,
                password  : 'mypassword',
                username  : 'myusername'
            });

            return instance
                .query('SELECT *')
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('jsforce connection not created');
                });
        });
    });
});
