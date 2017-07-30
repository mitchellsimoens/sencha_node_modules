const { expect }                     = require('chai');
const { Base, Deferrable, Deferred } = require('../../');

describe('Sencha.core.Deferrable', function () {
    let Cls, instance;

    beforeEach(function () {
        Cls = class extends Base {
            static get meta () {
                return {
                    mixins : [
                        Deferrable
                    ]
                };
            }
        };
    });

    afterEach(function () {
        Cls = null;

        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should mix into class', function () {
            expect(instance).to.have.property('isDeferrable', true);
        });
    });

    describe('ctor', function () {
        it('should create a deferred instance', function () {
            instance = new Cls();

            expect(instance).to.have.property('deferred');
            expect(instance.deferred).to.be.instanceOf(Deferred);
        });

        it('should not create a deferred instance', function () {
            const deferred = new Deferred();

            instance = new Cls({
                deferred
            });

            expect(instance).to.have.property('deferred', deferred);
        });
    });

    describe('promise', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should get deferred promise', function () {
            expect(instance).to.have.property('promise');

            expect(instance.promise).to.be.a('promise');
        });
    });

    describe('resolve', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should resolve the promise', function () {
            const spy = this.sandbox.spy();

            instance.then(spy);

            instance.resolve('foo');

            return instance
                .then(() => {
                    spy.should.have.been.calledWith('foo');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should execute onResolve', function () {
            const spy = this.sandbox.spy();

            instance.onResolve = spy;

            instance.resolve('foo');

            spy.should.have.been.calledWith('foo');
        });
    });

    describe('reject', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should reject the promise', function () {
            const spy = this.sandbox.spy();

            instance.catch(spy);

            instance.reject(new Error('foo'));

            return instance
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(spy).to.have.been.called;
                    expect(error.message).to.equal('foo');
                });
        });

        it('should reject the promise with a string', function () {
            const spy = this.sandbox.spy();

            instance.catch(spy);

            instance.reject('foo');

            return instance
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(spy).to.have.been.called;
                    expect(error.message).to.equal('foo');
                });
        });

        it('should execute onReject', function () {
            const spy = this.sandbox.spy();

            instance.onReject = spy;

            instance.reject(new Error('foo'));

            expect(spy).to.have.been.called;

            return instance.catch(() => {});
        });
    });
});
