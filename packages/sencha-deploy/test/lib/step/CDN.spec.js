const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    step : { CDN },
    util : { Logger }
} = require('../../../');

describe('CDN', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('execute', function () {
        it('should return a promise', function () {
            const { sandbox }   = this;
            const FakeSSHRunner = this[ 'sencha-deploy' ].createObservable({
                execute : sandbox.stub().resolves({
                    success : true
                })
            });

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            const CDN = proxyquire(
                '../../../lib/step/QA',
                {
                    '../' : {
                        step : {
                            ssh : {
                                SSHRunner : FakeSSHRunner
                            }
                        },
                        util : {
                            Logger,
                            Config : {
                                get () {}
                            }
                        }
                    }
                }
            );

            instance = new CDN();

            const promise = instance.execute({
                info : {
                    args : {}
                }
            });

            expect(promise).to.be.a('promise');

            mock.verify();
        });

        it('should resolve with nothing to do', function () {
            const { sandbox }   = this;
            const FakeSSHRunner = this[ 'sencha-deploy' ].createObservable({
                execute : sandbox.stub().resolves({
                    success : true
                })
            });

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            const CDN = proxyquire(
                '../../../lib/step/QA',
                {
                    '../' : {
                        step : {
                            ssh : {
                                SSHRunner : FakeSSHRunner
                            }
                        },
                        util : {
                            Logger,
                            Config : {
                                get () {}
                            }
                        }
                    }
                }
            );

            instance = new CDN();

            const promise = instance.execute({
                info : {
                    args : {}
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should resolve passing true', function () {
            const { sandbox }   = this;
            const FakeSSHRunner = this[ 'sencha-deploy' ].createObservable({
                execute : sandbox.stub().resolves({
                    success : true
                })
            });

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            const CDN = proxyquire(
                '../../../lib/step/QA',
                {
                    '../' : {
                        step : {
                            ssh : {
                                SSHRunner : FakeSSHRunner
                            }
                        },
                        util : {
                            Logger,
                            Config : {
                                get () {}
                            }
                        }
                    }
                }
            );

            instance = new CDN();

            const promise = instance.execute({
                info : {
                    args : {
                        cdn : true
                    }
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should resolve after executing', function () {
            const { sandbox }   = this;
            const FakeSSHRunner = this[ 'sencha-deploy' ].createObservable({
                execute : sandbox.stub().resolves({
                    success : true
                })
            });

            const CDN = proxyquire(
                '../../../lib/step/CDN',
                {
                    '../' : {
                        step : {
                            ssh : {
                                SSHRunner : FakeSSHRunner
                            }
                        },
                        util : {
                            Logger,
                            Config : {
                                get () {}
                            }
                        }
                    }
                }
            );

            instance = new CDN();

            const promise = instance.execute({
                info : {
                    args : {
                        cdn : '/foo'
                    }
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should reject after executing with error', function () {
            const { sandbox }   = this;
            const FakeSSHRunner = this[ 'sencha-deploy' ].createObservable({
                execute : sandbox.stub().rejects(new Error('foo'))
            });

            const CDN = proxyquire(
                '../../../lib/step/CDN',
                {
                    '../' : {
                        step : {
                            ssh : {
                                SSHRunner : FakeSSHRunner
                            }
                        },
                        util : {
                            Logger,
                            Config : {
                                get () {}
                            }
                        }
                    }
                }
            );

            instance = new CDN();

            const promise = instance.execute({
                info : {
                    args : {
                        cdn : '/foo'
                    }
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo')
                });
        });
    });

    describe('getStagePath', function () {
        it('should use cdn-stage argument', function () {
            instance = new CDN();

            const path = instance.getStagePath({
                'cdn-stage' : '/foo'
            });

            expect(path).to.equal('/foo');
        });

        it('should use cdn argument', function () {
            instance = new CDN();

            const path = instance.getStagePath({
                cdn : '/foo'
            });

            expect(path).to.equal('/foo');
        });
    });

    describe('getDestinationPath', function () {
        it('should use cdn argument', function () {
            instance = new CDN();

            const path = instance.getDestinationPath({
                cdn : '/foo'
            });

            expect(path).to.equal(`/foo`);
        });
    });

    describe('getExtractInfo', function () {
        it('should return false if no args', function () {
            instance = new CDN();

            const info = instance.getExtractInfo({});

            expect(info).to.have.property('extract', false);
        });

        it('should return true for extract', function () {
            instance = new CDN();

            const info = instance.getExtractInfo({
                'cdn-extract' : true
            });

            expect(info).to.have.property('extract', true);
        });

        it('should return path for extract', function () {
            instance = new CDN();

            const info = instance.getExtractInfo({
                'cdn-extract' : '/foo'
            });

            expect(info).to.have.property('extract', '/foo');
        });

        it('should return path for extract and extract destination', function () {
            instance = new CDN();

            const info = instance.getExtractInfo({
                'cdn-extract'             : '/foo',
                'cdn-extract-destination' : '/bar'
            });

            expect(info).to.have.property('extract',     '/foo');
            expect(info).to.have.property('extractDest', `/bar`);
        });
    });
});
