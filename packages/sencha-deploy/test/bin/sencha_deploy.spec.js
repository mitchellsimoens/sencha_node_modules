const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    error : { FatalError },
    util  : { Logger, Shutdown }
} = require('../../');

describe('Sencha Deploy', function () {
    beforeEach(function () {
        Logger.init();
    });

    it('should run main functional', function (done) {
        const { sandbox }  = this;
        const ShutdownMock = sandbox.mock(Shutdown);
        const arg_stub     = sandbox.stub().returns(null);
        const args_stub    = sandbox.stub().resolves();
        const conf_stub    = sandbox.stub().resolves();
        const run_stub     = sandbox.stub().resolves();
        const app_stub     = sandbox.stub().returns({
            config            : {
                logger : {
                    level : 'INFO'
                }
            },
            getArgument       : arg_stub,
            getArguments      : args_stub,
            createConnections : conf_stub,
            run               : run_stub
        });

        ShutdownMock.expects('execCallbacks').once();

        proxyquire(
            '../../bin/sencha_deploy',
            {
                '../' : {
                    App  : app_stub,
                    util : {
                        Logger,
                        Shutdown
                    }
                }
            }
        );

        setTimeout(function () { // TODO: a hack to handle async nature of code, need to improve
            expect(arg_stub).to.be.called;
            expect(args_stub).to.be.called;
            expect(conf_stub).to.be.called;
            expect(run_stub).to.be.called;

            ShutdownMock.verify();

            done();
        }, 1);
    });

    it('should log error and exit', function (done) {
        const { sandbox }      = this;
        const arg_stub         = sandbox.stub().returns('/foo/bar');
        const args_stub        = sandbox.stub().resolves();
        const conf_stub        = sandbox.stub().rejects({ error : 'foo' });
        const run_stub         = sandbox.stub().resolves();
        const finish_stub      = sandbox.stub().returns();
        const logger_init_stub = sandbox.stub().resolves();
        const logger_log_stub  = sandbox.stub();
        const logger_file_stub = sandbox.stub();
        const app_stub         = sandbox.stub().returns({
            config            : {
                logger : {
                    level : 'INFO'
                }
            },
            getArgument       : arg_stub,
            getArguments      : args_stub,
            createConnections : conf_stub,
            run               : run_stub,
            finish            : finish_stub
        });

        sandbox.stub(process, 'exit');

        proxyquire(
            '../../bin/sencha_deploy',
            {
                '../' : {
                    App  : app_stub,
                    util : {
                        Shutdown,
                        Logger : {
                            init   : logger_init_stub,
                            log    : logger_log_stub,
                            toFile : logger_file_stub,
                            error  : function(...args) {
                                args.unshift('ERROR');

                                return logger_log_stub(...args);
                            },
                            info   : function(...args) {
                                args.unshift('INFO');

                                return logger_log_stub(...args);
                            }
                        }
                    }
                }
            }
        );

        setTimeout(function () { // TODO: a hack to handle async nature of code, need to improve
            expect(arg_stub).to.be.called;
            expect(args_stub).to.be.called;
            expect(conf_stub).to.be.called;
            expect(run_stub).not.to.be.called;
            expect(finish_stub).not.to.be.called;

            expect(logger_init_stub).to.be.called;
            expect(logger_log_stub).to.be.calledTwice;
            expect(logger_file_stub).to.be.calledOnce;

            done();
        }, 1);
    });

    it('should log out error stack in development', function (done) {
        const { sandbox }    = this;
        const arg_stub         = sandbox.stub().returns('/foo/bar');
        const args_stub        = sandbox.stub().resolves();
        const conf_stub        = sandbox.stub().rejects(new Error('foo'));
        const run_stub         = sandbox.stub().resolves();
        const logger_init_stub = sandbox.stub().resolves();
        const logger_log_stub  = sandbox.stub();
        const logger_file_stub = sandbox.stub();
        const app_stub         = sandbox.stub().returns({
            config            : {
                logger : {
                    level : 'INFO'
                }
            },
            getArgument       : arg_stub,
            getArguments      : args_stub,
            createConnections : conf_stub,
            run               : run_stub
        });

        sandbox.stub(process, 'exit');

        proxyquire(
            '../../bin/sencha_deploy',
            {
                '../' : {
                    App  : app_stub,
                    util : {
                        Shutdown,
                        Logger : {
                            init   : logger_init_stub,
                            log    : logger_log_stub,
                            toFile : logger_file_stub,
                            debug  : function (...args) {
                                args.unshift('DEBUG');

                                return logger_log_stub(...args);
                            },
                            error  : function(...args) {
                                args.unshift('ERROR');

                                return logger_log_stub(...args);
                            },
                            info   : function(...args) {
                                args.unshift('INFO');

                                return logger_log_stub(...args);
                            }
                        }
                    }
                }
            }
        );

        setTimeout(function () {
            expect(logger_log_stub).to.be.calledThrice;
            expect(logger_file_stub).to.be.calledOnce;

            done();
        }, 1);
    });

    it('should handle a FatalError', function (done) {
        const { sandbox }          = this;
        const arg_stub         = sandbox.stub().returns('/foo/bar');
        const args_stub        = sandbox.stub().resolves();
        const conf_stub        = sandbox.stub().rejects(new FatalError('foo'));
        const run_stub         = sandbox.stub().resolves();
        const logger_init_stub = sandbox.stub().resolves();
        const logger_log_stub  = sandbox.stub();
        const logger_file_stub = sandbox.stub();
        const app_stub         = sandbox.stub().returns({
            config            : {
                logger : {
                    level : 'INFO'
                }
            },
            getArgument       : arg_stub,
            getArguments      : args_stub,
            createConnections : conf_stub,
            run               : run_stub
        });

        sandbox.stub(process, 'exit');

        proxyquire(
            '../../bin/sencha_deploy',
            {
                '../' : {
                    App  : app_stub,
                    util : {
                        Shutdown,
                        Logger : {
                            init   : logger_init_stub,
                            log    : logger_log_stub,
                            toFile : logger_file_stub,
                            debug  : function(...args) {
                                args.unshift('DEBUG');

                                return logger_log_stub(...args);
                            },
                            error  : function(...args) {
                                args.unshift('ERROR');

                                return logger_log_stub(...args);
                            },
                            info   : function(...args) {
                                args.unshift('INFO');

                                return logger_log_stub(...args);
                            }
                        }
                    }
                }
            }
        );

        setTimeout(function () {
            expect(logger_log_stub).to.be.calledThrice;
            expect(logger_file_stub).to.be.calledOnce;

            done();
        }, 1);
    });

    describe('log', function () {
        it('should output log to file', function (done) {
            const { sandbox }      = this;
            const ShutdownMock     = sandbox.mock(Shutdown);
            const arg_stub         = sandbox.stub().returns('/foo/log.txt');
            const args_stub        = sandbox.stub().resolves();
            const conf_stub        = sandbox.stub().resolves();
            const run_stub         = sandbox.stub().resolves();
            const logger_init_stub = sandbox.stub().resolves();
            const logger_log_stub  = sandbox.stub()
            const logger_file_stub = sandbox.stub();
            const app_stub         = sandbox.stub().returns({
                config            : {
                    logger : {
                        level : 'INFO'
                    }
                },
                getArgument       : arg_stub,
                getArguments      : args_stub,
                createConnections : conf_stub,
                run               : run_stub
            });

            ShutdownMock.expects('execCallbacks').once();

            proxyquire(
                '../../bin/sencha_deploy',
                {
                    '../' : {
                        App  : app_stub,
                        util : {
                            Shutdown,
                            Logger : {
                                init   : logger_init_stub,
                                log    : logger_log_stub,
                                toFile : logger_file_stub,
                                error  : function(...args) {
                                    args.unshift('ERROR');

                                    return logger_log_stub(...args);
                                },
                                info   : function(...args) {
                                    args.unshift('INFO');

                                    return logger_log_stub(...args);
                                }
                            }
                        }
                    }
                }
            );

            setTimeout(function () { // TODO: a hack to handle async nature of code, need to improve
                expect(arg_stub).to.be.called;
                expect(args_stub).to.be.called;
                expect(conf_stub).to.be.called;
                expect(run_stub).to.be.called;

                expect(logger_file_stub).to.be.calledOnce;

                ShutdownMock.verify();

                done();
            }, 10);
        });

        it('should not output log if log argument is true', function (done) {
            const { sandbox }      = this;
            const ShutdownMock     = sandbox.mock(Shutdown);
            const arg_stub         = sandbox.stub().returns(true);
            const args_stub        = sandbox.stub().resolves();
            const conf_stub        = sandbox.stub().resolves();
            const run_stub         = sandbox.stub().resolves();
            const logger_init_stub = sandbox.stub().resolves();
            const logger_log_stub  = sandbox.stub();
            const logger_file_stub = sandbox.stub();
            const app_stub         = sandbox.stub().returns({
                config            : {
                    logger : {
                        level : 'INFO'
                    }
                },
                getArgument       : arg_stub,
                getArguments      : args_stub,
                createConnections : conf_stub,
                run               : run_stub
            });

            ShutdownMock.expects('execCallbacks').once();

            proxyquire(
                '../../bin/sencha_deploy',
                {
                    '../' : {
                        App  : app_stub,
                        util : {
                            Shutdown,
                            Logger : {
                                init   : logger_init_stub,
                                log    : logger_log_stub,
                                toFile : logger_file_stub,
                                error  : function(...args) {
                                    args.unshift('ERROR');

                                    return logger_log_stub(...args);
                                },
                                info   : function(...args) {
                                    args.unshift('INFO');

                                    return logger_log_stub(...args);
                                }
                            }
                        }
                    }
                }
            );

            setTimeout(function () { // TODO: a hack to handle async nature of code, need to improve
                expect(arg_stub).to.be.called;
                expect(args_stub).to.be.called;
                expect(conf_stub).to.be.called;
                expect(run_stub).to.be.called;

                expect(logger_file_stub).to.not.be.called;

                ShutdownMock.verify();

                done();
            }, 10);
        });

        it('should not output log if log argument was not passed', function (done) {
            const { sandbox }      = this;
            const ShutdownMock     = sandbox.mock(Shutdown);
            const arg_stub         = sandbox.stub().returns();
            const args_stub        = sandbox.stub().resolves();
            const conf_stub        = sandbox.stub().resolves();
            const run_stub         = sandbox.stub().resolves();
            const logger_init_stub = sandbox.stub().resolves();
            const logger_log_stub  = sandbox.stub();
            const logger_file_stub = sandbox.stub();
            const app_stub         = sandbox.stub().returns({
                config            : {
                    logger : {
                        level : 'INFO'
                    }
                },
                getArgument       : arg_stub,
                getArguments      : args_stub,
                createConnections : conf_stub,
                run               : run_stub
            });

            ShutdownMock.expects('execCallbacks').once();

            proxyquire(
                '../../bin/sencha_deploy',
                {
                    '../' : {
                        App  : app_stub,
                        util : {
                            Shutdown,
                            Logger : {
                                init   : logger_init_stub,
                                log    : logger_log_stub,
                                toFile : logger_file_stub,
                                error  : function(...args) {
                                    args.unshift('ERROR');

                                    return logger_log_stub(...args);
                                },
                                info   : function(...args) {
                                    args.unshift('INFO');

                                    return logger_log_stub(...args);
                                }
                            }
                        }
                    }
                }
            );

            setTimeout(function () { // TODO: a hack to handle async nature of code, need to improve
                expect(arg_stub).to.be.called;
                expect(args_stub).to.be.called;
                expect(conf_stub).to.be.called;
                expect(run_stub).to.be.called;

                expect(logger_file_stub).to.not.be.called;

                ShutdownMock.verify();

                done();
            }, 10);
        });
    });
});
