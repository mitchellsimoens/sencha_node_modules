const { expect } = require('chai');
const proxyquire = require('proxyquire');

const { util : { Logger } } = require('../../../../');

describe('SSHUpload', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('execute', function () {
        it('should return a promise', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const FakeSCP     = this[ 'sencha-deploy' ].createObservable({
                upload : sandbox.stub().resolves({ success : true })
            });

            mock.expects('log').once();

            const SSHUpload = proxyquire(
                '../../../../lib/step/ssh/SSHUpload',
                {
                    '../../' : {
                        transfer : {
                            SCP2 : FakeSCP
                        }
                    }
                }
            );

            instance = new SSHUpload();

            const promise = instance.execute({
                info : {
                    args : {
                        path : '/foo'
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

        it('should resolve on upload success', function () {
            const { sandbox } = this;
            const upload_stub = sandbox.stub().resolves({ success : true });
            const FakeSCP     = function SCP2 () {};

            FakeSCP.prototype.upload = upload_stub;

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            const SSHUpload = proxyquire(
                '../../../../lib/step/ssh/SSHUpload',
                {
                    '../../' : {
                        transfer : {
                            SCP2 : FakeSCP
                        }
                    }
                }
            );

            instance = new SSHUpload({
                stagedPath : '/stage'
            });

            const promise = instance.execute({
                info : {
                    args : {
                        path : '/foo'
                    }
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(upload_stub).to.have.calledWithExactly('/foo', '/stage');

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should reject on upload failure', function () {
            const { sandbox } = this;
            const upload_stub = sandbox.stub().rejects(new Error('foo'));
            const FakeSCP     = function SCP2 () {};

            FakeSCP.prototype.upload = upload_stub;

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            const SSHUpload = proxyquire(
                '../../../../lib/step/ssh/SSHUpload',
                {
                    '../../' : {
                        transfer : {
                            SCP2 : FakeSCP
                        }
                    }
                }
            );

            instance = new SSHUpload({
                stagedPath : '/stage'
            });

            const promise = instance.execute({
                info : {
                    args : {
                        path : '/foo'
                    }
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');

                    expect(upload_stub).to.have.calledWithExactly('/foo', '/stage');

                    mock.verify();
                });
        });
    });
});
