const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    step : { QA },
    util : { Logger }
} = require('../../../');

describe('QA', function () {
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

            const QA = proxyquire(
                '../../../lib/step/QA',
                {
                    '../util/Config'  : {
                        get () {}
                    },
                    './ssh/SSHRunner' : FakeSSHRunner
                }
            );

            instance = new QA();

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

            const QA = proxyquire(
                '../../../lib/step/QA',
                {
                    '../util/Config'  : {
                        get () {}
                    },
                    './ssh/SSHRunner' : FakeSSHRunner
                }
            );

            instance = new QA();

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

            const QA = proxyquire(
                '../../../lib/step/QA',
                {
                    '../util/Config'  : {
                        get () {}
                    },
                    './ssh/SSHRunner' : FakeSSHRunner
                }
            );

            instance = new QA();

            const promise = instance.execute({
                info : {
                    args : {
                        qa : true
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

            const QA = proxyquire(
                '../../../lib/step/QA',
                {
                    '../' : {
                        step : {
                            ssh  : {
                                SSHRunner : FakeSSHRunner
                            }
                        },
                        util : {
                            Config : {
                                get () {}
                            }
                        }
                    }
                }
            );

            instance = new QA();

            const promise = instance.execute({
                info : {
                    args : {
                        qa : '/foo'
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

            const QA = proxyquire(
                '../../../lib/step/QA',
                {
                    '../' : {
                        step : {
                            ssh : {
                                SSHRunner : FakeSSHRunner
                            }
                        },
                        util : {
                            Config : {
                                get () {}
                            }
                        }
                    }
                }
            );

            instance = new QA();

            const promise = instance.execute({
                info : {
                    args : {
                        qa : '/foo'
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
        it('should use qa-stage argument', function () {
            instance = new QA();

            const path = instance.getStagePath({
                'qa-stage' : '/foo'
            });

            expect(path).to.equal('/foo');
        });

        it('should use qa argument', function () {
            instance = new QA();

            const path = instance.getStagePath({
                qa : '/foo'
            });

            expect(path).to.equal('/foo');
        });
    });

    describe('getDestinationPath', function () {
        it('should use qa argument', function () {
            instance = new QA();

            const date = new Date().toISOString().substr(0, 10).replace(/-/g, '');
            const path = instance.getDestinationPath({
                qa : '/foo'
            });

            expect(path).to.equal(`/foo/${date}`);
        });
    });

    describe('getExtractInfo', function () {
        it('should return false if no args', function () {
            instance = new QA();

            const info = instance.getExtractInfo({});

            expect(info).to.have.property('extract', false);
        });

        it('should return true for extract', function () {
            instance = new QA();

            const info = instance.getExtractInfo({
                'qa-extract' : true
            });

            expect(info).to.have.property('extract', true);
        });

        it('should return path for extract', function () {
            instance = new QA();

            const info = instance.getExtractInfo({
                'qa-extract' : '/foo'
            });

            expect(info).to.have.property('extract', '/foo');
        });

        it('should return path for extract and extract destination', function () {
            instance = new QA();

            const date = new Date().toISOString().substr(0, 10).replace(/-/g, '');

            const info = instance.getExtractInfo({
                'qa-extract'             : '/foo',
                'qa-extract-destination' : '/bar'
            });

            expect(info).to.have.property('extract',     '/foo');
            expect(info).to.have.property('extractDest', `/bar/${date}`);
        });
    });

    describe('getDate', function () {
        it('should use default argument', function () {
            instance = new QA();

            const date = instance.getDate();

            expect(date).to.equal(new Date().toISOString().substr(0, 10).replace(/-/g, ''));
        });

        it('should use date passed in', function () {
            instance = new QA();

            const date = instance.getDate(new Date('2017-01-03'));

            expect(date).to.equal('20170103');
        });
    });
});
