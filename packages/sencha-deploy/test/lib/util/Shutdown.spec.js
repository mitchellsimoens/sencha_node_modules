const { expect } = require('chai');

const {
    error : { FatalError },
    util  : { Logger, Shutdown }
} = require('../../../');

describe('Shutdown', function () {
    it('calls specified callbacks on shutdown', function () {
        const { sandbox } = this;

        sandbox.stub(process, 'exit');

        const stub1 = sandbox.stub();
        const stub2 = sandbox.stub();

        Shutdown.onShutdown(stub1);
        Shutdown.onShutdown(stub2);

        const mock = sandbox.mock(Logger);

        mock.expects('log').twice();

        const res = Shutdown.execCallbacks();

        return res.then(
            () => {
                expect(stub1).to.be.calledOnce;
                expect(stub2).to.be.calledOnce;

                mock.verify();
            }
        );
    });

    describe('onUncaught', function () {
        it('should not quit if test environment', function () {
            const { sandbox } = this;
            const stub        = sandbox.stub(process, 'exit');

            sandbox.stub(process, 'env').value({
                NODE_ENV : 'test'
            });

            Shutdown.onUncaught(new Error('foo'));

            expect(stub).to.not.be.called;
        });

        it('should quit if not test environment', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const stub        = sandbox.stub(process, 'exit');

            mock.expects('log').once();

            Shutdown.onUncaught(new Error('foo'));

            expect(stub).to.be.calledOnce;
            expect(stub).to.be.calledWith(0);

            mock.verify();
        });

        it('should quit if not test environment with FatalError', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const stub        = sandbox.stub(process, 'exit');

            mock.expects('log').once();

            Shutdown.onUncaught(new FatalError('foo'));

            expect(stub).to.be.calledOnce;
            expect(stub).to.be.calledWith(1);

            mock.verify();
        });
    });

    describe('execCallbacks', function () {
        afterEach(function () {
            Shutdown.callbacks.length = 0;
        });

        it('should handle no errors in callbacks', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const stub        = sandbox.stub(process, 'exit');

            mock.expects('log').twice();

            Shutdown.onShutdown(function() {});

            const promise = Shutdown.execCallbacks();

            return promise
                .then(() => {
                    expect(stub).to.be.calledOnce;
                    expect(stub).to.be.calledWith(0);

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle error in a callback', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const stub        = sandbox.stub(process, 'exit');

            mock.expects('log').twice();

            Shutdown.onShutdown(function () {
                return new Promise((resolve, reject) => {
                    reject('foo');
                });
            });

            const promise = Shutdown.execCallbacks();

            return promise
                .then(() => {
                    expect(stub).to.be.calledOnce;
                    expect(stub).to.be.calledWith(0);

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });
});
