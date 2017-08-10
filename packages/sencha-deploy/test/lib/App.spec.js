const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

describe('App', () => {
    it('should read args and loads config on app create', () => {
        const argsStub   = sinon.stub().returns({ config : 'foo' });
        const confStub   = sinon.stub();
        const App         = proxyquire(
            '../../lib/App',
            {
                './' : {
                    util : {
                        Args   : argsStub,
                        Config : {
                            load : confStub
                        }
                    }
                }
            }
        );

        new App();

        expect(argsStub).to.be.called;
        expect(confStub).to.be.called;
        expect(confStub.args[ 0 ][ 0 ]).to.eql('foo');
    });

    it('should validate db and storage connection', function * () {
        const dbStub     = sinon.stub().resolves();
        const strStub    = sinon.stub().resolves();
        const argsStub   = sinon.stub().returns({ config : 'foo' });
        const confStub   = sinon.stub();
        const App         = proxyquire(
            '../../lib/App',
            {
                './' : {
                    db : {
                        create : dbStub
                    },
                    storage : {
                        create : strStub
                    },
                    util : {
                        Args   : argsStub,
                        Config : {
                            load : confStub
                        }
                    }
                }
            }
        );

        const app = new App();

        yield app.createConnections();

        expect(dbStub).to.be.called;
        expect(strStub).to.be.called;
    });

    it('should throw an error if db or storage connection is invalid', () => {
        const confStub   = sinon.stub();
        const argsStub   = sinon.stub().returns({
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
                        Args   : argsStub,
                        Config : {
                            load : confStub
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

    it('should resolve arguments', () => {
        const getArgsStub = sinon.stub();
        const argsStub    = sinon.stub().returns({
            config       : 'foo',
            getArguments : getArgsStub
        });
        const confStub     = sinon.stub();
        const App          = proxyquire(
            '../../lib/App',
            {
                './' : {
                    util : {
                        Args   : argsStub,
                        Config : {
                            load : confStub
                        }
                    }
                }
            }
        );

        const app = new App();

        app.getArguments();

        expect(getArgsStub).to.be.called;
    });

    describe('getArgument', () => {
        it('should return an argument', () => {
            const getArgStub = sinon
                .stub()
                .withArgs('foo')
                .returns('bar');
            const argsStub   = sinon.stub().returns({
                config      : 'foo',
                getArgument : getArgStub
            });
            const confStub   = sinon.stub();
            const App        = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        util : {
                            Args   : argsStub,
                            Config : {
                                load : confStub
                            }
                        }
                    }
                }
            );

            const app = new App();

            const arg = app.getArgument('foo');

            expect(getArgStub).to.be.called;
            expect(arg).to.equal('bar');
        });

        it('should not return an argument', () => {
            const getArgStub = sinon
                .stub()
                .withArgs('foo')
                .returns(undefined);
            const argsStub   = sinon.stub().returns({
                config      : 'foo',
                getArgument : getArgStub
            });
            const confStub   = sinon.stub();
            const App        = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        util : {
                            Args   : argsStub,
                            Config : {
                                load : confStub
                            }
                        }
                    }
                }
            );

            const app = new App();
            const arg = app.getArgument('foo');

            expect(getArgStub).to.be.called;
            expect(arg).to.be.undefined;
        });
    });

    describe('module', () => {
        it('should run nightly module', () => {
            const modRunStub = sinon.stub();
            const moduleStub = sinon.stub().returns({ run : modRunStub });
            const argsStub   = sinon.stub().returns({
                module  : 'nightly',
                product : 'ext',
                version : '1.0.0'
            });
            const confStub   = sinon.stub().returns({
                modules : {
                    nightly : {}
                },
                s3 : {}
            });
            const App        = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        module : {
                            nightly : moduleStub
                        },
                        util : {
                            Args   : argsStub,
                            Config : {
                                load : confStub
                            }
                        }
                    }
                }
            );

            const app = new App();

            app.run();

            expect(modRunStub).to.be.called;
        });

        it('should run release module', () => {
            const modRunStub = sinon.stub();
            const moduleStub = sinon.stub().returns({ run : modRunStub });
            const argsStub   = sinon.stub().returns({
                module  : 'release',
                product : 'ext',
                version : '1.0.0'
            });
            const confStub   = sinon.stub().returns({
                modules : {
                    release : {}
                },
                s3 : {}
            });
            const App        = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        module : {
                            release : moduleStub
                        },
                        util : {
                            Args   : argsStub,
                            Config : {
                                load : confStub
                            }
                        }
                    }
                }
            );

            const app = new App();

            app.run();

            expect(modRunStub).to.be.called;
        });

        it('should not recognize module', () => {
            const modRunStub = sinon.stub();
            const moduleStub = sinon.stub().returns({ run : modRunStub });
            const argsStub   = sinon.stub().returns({
                module  : 'foo',
                product : 'ext',
                version : '1.0.0'
            });
            const confStub   = sinon.stub().returns({
                modules : {
                    release : {}
                },
                s3 : {}
            });
            const App        = proxyquire(
                '../../lib/App',
                {
                    './' : {
                        module : {
                            release : moduleStub
                        },
                        util : {
                            Args   : argsStub,
                            Config : {
                                load : confStub
                            }
                        }
                    }
                }
            );

            const app = new App();
            const fn  = () => {
                app.run();
            };

            expect(fn).to.throw(Error, 'Module not recognized');
            expect(modRunStub).to.not.be.called;
        });
    });
});
