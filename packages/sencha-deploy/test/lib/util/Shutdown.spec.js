const { expect } = require('chai');
const sinon      = require('sinon');

const {
    error : { FatalError },
    util  : { Logger, Shutdown }
} = require('../../../');

describe('Shutdown', () => {
    it('calls specified callbacks on shutdown', () => {
        const stub = sinon.stub(process, 'exit');

        const stub1 = sinon.stub();
        const stub2 = sinon.stub();

        Shutdown.onShutdown(stub1);
        Shutdown.onShutdown(stub2);

        const mock = sinon.mock(Logger);

        mock.expects('log').twice();

        const res = Shutdown.execCallbacks();

        return res
            .then(() => {
                expect(stub1).to.be.calledOnce;
                expect(stub2).to.be.calledOnce;

                mock.verify();
                stub.restore();
            })
            .catch(() => {
                expect(false).to.be.true;
            });
    });

    describe('onUncaught', () => {
        it('should not quit if test environment', () => {
            const stub    = sinon.stub(process, 'exit');
            const envStub = sinon.stub(process, 'env').value({
                NODE_ENV : 'test'
            });

            Shutdown.onUncaught(new Error('foo'));

            expect(stub).to.not.be.called;

            envStub.restore();
            stub.restore();
        });

        it('should quit if not test environment', () => {
            const mock = sinon.mock(Logger);
            const stub = sinon.stub(process, 'exit');

            mock.expects('log').once();

            Shutdown.onUncaught(new Error('foo'));

            expect(stub).to.be.calledOnce;
            expect(stub).to.be.calledWith(0);

            mock.verify();
            stub.restore();
        });

        it('should quit if not test environment with FatalError', () => {
            const mock = sinon.mock(Logger);
            const stub = sinon.stub(process, 'exit');

            mock.expects('log').once();

            Shutdown.onUncaught(new FatalError('foo'));

            expect(stub).to.be.calledOnce;
            expect(stub).to.be.calledWith(1);

            mock.verify();
            stub.restore();
        });
    });

    describe('execCallbacks', () => {
        afterEach(() => {
            Shutdown.callbacks.length = 0;
        });

        it('should handle no errors in callbacks', () => {
            const mock = sinon.mock(Logger);

            mock.expects('log').twice();

            Shutdown.onShutdown(() => {}); // eslint-disable-line no-empty-function

            const promise = Shutdown.execCallbacks();

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch((e) => {
                    console.log(e);
                    expect(false).to.be.true;
                });
        });

        it('should handle error in a callback', () => {
            const mock = sinon.mock(Logger);

            mock.expects('log').twice();

            Shutdown.onShutdown(() => new Promise((resolve, reject) => {
                reject(new Error('foo'));
            }));

            const promise = Shutdown.execCallbacks();

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });
});
