const { expect }   = require('chai');
const { Deferred } = require('../../');

describe('Sencha.core.Deferred', function () {
    describe('instantiation', function () {
        it('should create promise', function () {
            const deferred = new Deferred();

            expect(deferred.promise).to.be.a('promise');
        });

        it('should have resolve function', function () {
            const deferred = new Deferred();

            expect(deferred.resolve).to.be.a('function');
        });

        it('should have reject function', function () {
            const deferred = new Deferred();

            expect(deferred.reject).to.be.a('function');
        });
    });

    describe('resolves', function () {
        it('should be resolvable', function () {
            const deferred = new Deferred();
            const spy      = this.sandbox.spy();
            const promise  = deferred.promise.then(spy);

            deferred.resolve('foo');

            return promise
                .then(() => {
                    expect(spy).to.have.been.calledWith('foo');
                })
                .catch(() => {
                    // should execute, trigger a failure if it does
                    expect(false).to.be.true;
                });
        });

        it('should not fire resolve callback on error', function () {
            const deferred = new Deferred();
            const spy      = this.sandbox.spy();
            const err      = new Error('foo');
            const promise  = deferred.promise.then(spy);

            deferred.reject(err);

            return promise
                .then(() => {
                    // should execute, trigger a failure if it does
                    expect(false).to.be.true;
                })
                .catch(() => {
                    expect(spy).to.have.not.been.called;
                });
        });
    });

    describe('rejects', function () {
        it('should be rejectable using then', function () {
            const deferred = new Deferred();
            const spy      = this.sandbox.spy();
            const err      = new Error('foo');
            const promise  = deferred.promise.then(null, spy);

            deferred.reject(err);

            return promise
                .then(() => {
                    expect(spy).to.have.been.calledWith(err);
                })
                .catch(() => {
                    // should execute, trigger a failure if it does
                    expect(false).to.be.true;
                });
        });

        it('should be rejectable using catch', function () {
            const deferred = new Deferred();
            const spy      = this.sandbox.spy();
            const err      = new Error('foo');
            const promise  = deferred.promise.catch(spy);

            deferred.reject(err);

            return promise
                .then(() => {
                    // should execute, trigger a failure if it does
                    expect(false).to.be.true;
                })
                .catch(() => {
                    expect(spy).to.have.been.calledWith(err);
                });
        });
    });

    describe('then', function () {
        it('should add resolve fn', function () {
            const deferred = new Deferred();
            const spy      = this.sandbox.spy();

            deferred.resolve();

            return deferred
                .then(spy)
                .then(() => {
                    expect(spy).to.have.been.called;
                })
                .catch(() => {
                    // should execute, trigger a failure if it does
                    expect(false).to.be.true;
                });
        });

        it('should add reject fn', function () {
            const deferred = new Deferred();
            const spy      = this.sandbox.spy();

            deferred.reject();

            return deferred
                .then(null, spy)
                .then(() => {
                    expect(spy).to.have.been.called;
                })
                .catch(() => {
                    // should execute, trigger a failure if it does
                    expect(false).to.be.true;
                });
        });
    });

    describe('catch', function () {
        it('should add catch fn', function () {
            const deferred = new Deferred();
            const spy      = this.sandbox.spy();

            deferred.reject();

            return deferred
                .catch(spy)
                .then(() => {
                    expect(spy).to.have.been.called;
                })
                .catch(() => {
                    // should execute, trigger a failure if it does
                    expect(false).to.be.true;
                });
        });
    });
});
