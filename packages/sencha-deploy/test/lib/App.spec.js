const { expect } = require('chai');
const proxyquire = require('proxyquire');

describe('App', function () {
    it('should read args and loads config on app create', function () {
        const { sandbox } = this;
        const args_stub   = sandbox.stub().returns({ config : 'foo' });
        const conf_stub   = sandbox.stub();
        const App         = proxyquire(
            '../../lib/App',
            {
                './' : {
                    util : {
                        Args   : args_stub,
                        Config : {
                            load : conf_stub
                        }
                    }
                }
            }
        );

        new App();

        expect(args_stub).to.be.called;
        expect(conf_stub).to.be.called;
        expect(conf_stub.args[0][0]).to.eql('foo');
    });

    it('should validate db and storage connection', function * () {
        const { sandbox } = this;
        const db_stub     = sandbox.stub().resolves();
        const str_stub    = sandbox.stub().resolves();
        const args_stub   = sandbox.stub().returns({ config : 'foo' });
        const conf_stub   = sandbox.stub();
        const App         = proxyquire(
            '../../lib/App',
            {
                './' : {
                    db      : {
                        create : db_stub
                    },
                    storage : {
                        create : str_stub
                    },
                    util    : {
                        Args   : args_stub,
                        Config : {
                            load : conf_stub
                        }
                    }
                }
            }
        );

        const app = new App();

        yield app.createConnections();

        expect(db_stub).to.be.called;
        expect(str_stub).to.be.called;
    });

    it('should throw an error if db or storage connection is invalid', function () {
        const { sandbox } = this;
        const conf_stub   = sandbox.stub();
        const args_stub   = sandbox.stub().returns({
            arguments : {
                database : 'foo',
                storage  : 'bar'
            }
        });
        const App        = proxyquire(
            '../../lib/App',
            {
                './' : {
                    util : {
                        Args   : args_stub,
                        Config : {
                            load : conf_stub
                        }
                    }
                }
            }
        );

        const app = new App();

        return app
            .createConnections()
            .then(() => {
                expect(false).to.be.true;
            })
            .catch(error => {
                expect(error.message).to.equal('Database is not recognized');
            });
    });

    it('should resolve arguments', function () {
        const { sandbox }   = this;
        const get_args_stub = sandbox.stub();
        const args_stub     = sandbox.stub().returns({
            config       : 'foo',
            getArguments : get_args_stub
        });
        const conf_stub     = sandbox.stub();
        const App           = proxyquire(
            '../../lib/App',
            {
                './' : {
                    util : {
                        Args   : args_stub,
                        Config : {
                            load : conf_stub
                        }
                    }
                }
            }
        );

        const app = new App();

        app.getArguments();

        expect(get_args_stub).to.be.called;
    });

    describe('getArgument', function () {
        it('should return an argument', function () {
            const { sandbox }  = this;
            const get_arg_stub = sandbox.stub().withArgs('foo').returns('bar');
            const args_stub    = sandbox.stub().returns({
                config      : 'foo',
                getArgument : get_arg_stub
            });
            const conf_stub     = sandbox.stub();
            const App           = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        util : {
                            Args   : args_stub,
                            Config : {
                                load : conf_stub
                            }
                        }
                    }
                }
            );

            const app = new App();

            const arg = app.getArgument('foo');

            expect(get_arg_stub).to.be.called;
            expect(arg).to.equal('bar');
        });

        it('should not return an argument', function () {
            const { sandbox }  = this;
            const get_arg_stub = sandbox.stub().withArgs('foo').returns(undefined);
            const args_stub    = sandbox.stub().returns({
                config      : 'foo',
                getArgument : get_arg_stub
            });
            const conf_stub     = sandbox.stub();
            const App           = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        util : {
                            Args   : args_stub,
                            Config : {
                                load : conf_stub
                            }
                        }
                    }
                }
            );

            const app = new App();
            const arg = app.getArgument('foo');

            expect(get_arg_stub).to.be.called;
            expect(arg).to.be.undefined;
        });
    });

    describe('module', function () {
        it('should run nightly module', function () {
            const { sandbox }  = this;
            const mod_run_stub = sandbox.stub();
            const module_stub  = sandbox.stub().returns({ run : mod_run_stub });
            const args_stub    = sandbox.stub().returns({
                module  : 'nightly',
                product : 'ext',
                version : '1.0.0'
            });
            const conf_stub    = sandbox.stub().returns({
                modules : {
                    nightly : {}
                },
                s3      : {}
            });
            const App          = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        module : {
                            nightly : module_stub
                        },
                        util   : {
                            Args   : args_stub,
                            Config : {
                                load : conf_stub
                            }
                        }
                    }
                }
            );

            const app = new App();

            app.run();

            expect(mod_run_stub).to.be.called;
        });

        it('should run release module', function () {
            const { sandbox }  = this;
            const mod_run_stub = sandbox.stub();
            const module_stub  = sandbox.stub().returns({ run : mod_run_stub });
            const args_stub    = sandbox.stub().returns({
                module  : 'release',
                product : 'ext',
                version : '1.0.0'
            });
            const conf_stub    = sandbox.stub().returns({
                modules : {
                    release : {}
                },
                s3      : {}
            });
            const App         = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        module : {
                            release : module_stub
                        },
                        util   : {
                            Args   : args_stub,
                            Config : {
                                load : conf_stub
                            }
                        }
                    }
                }
            );

            const app = new App();

            app.run();

            expect(mod_run_stub).to.be.called;
        });

        it('should not recognize module', function () {
            const { sandbox }  = this;
            const mod_run_stub = sandbox.stub();
            const module_stub  = sandbox.stub().returns({ run : mod_run_stub });
            const args_stub    = sandbox.stub().returns({
                module  : 'foo',
                product : 'ext',
                version : '1.0.0'
            });
            const conf_stub    = sandbox.stub().returns({
                modules : {
                    release : {}
                },
                s3      : {}
            });
            const App          = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        module : {
                            release : module_stub
                        },
                        util   : {
                            Args   : args_stub,
                            Config : {
                                load : conf_stub
                            }
                        }
                    }
                }
            );

            const app = new App();
            const fn  = () => {
                app.run();
            };

            expect(fn).to.throw(Error, /^Class constructor FatalError cannot be invoked without 'new'$/);
            expect(mod_run_stub).to.not.be.called;
        });
    });
});
