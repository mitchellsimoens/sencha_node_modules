const { expect }   = require('chai');
const { Combiner } = require('../../../combiner/');

describe('Combiner', function () {
    let combiner;

    afterEach(function () {
        if (combiner) {
            combiner.destroy();
            combiner = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            combiner = new Combiner();
        });

        it('should be a combiner', function () {
            expect(combiner).to.have.property('isCombiner', true);
        });

        it('should mix deferrable in', function () {
            expect(combiner).to.have.property('isDeferrable', true);
        });
    });

    describe('ctor', function () {
        it('should create a buffered check function', function () {
            combiner = new Combiner({
                check : () => {}
            });

            expect(combiner.check).to.not.equal(combiner.identityFn);
        });

        it('should use passed in data', function () {
            const data = {};

            combiner = new Combiner({
                data
            });

            expect(combiner.data).to.equal(data);
        });
    });

    describe('dtor', function () {
        it('should clear data and check properties', function () {
            combiner = new Combiner({
                check    : () => {},
                data     : {},
                hasError : 'foo'
            });

            combiner.destroy();

            expect(combiner.check).to.be.null;
            expect(combiner.data).to.be.null;
            expect(combiner.hasError).to.be.null;

            combiner = null;
        });
    });

    describe('createBuffered', function () {
        beforeEach(function () {
            combiner = new Combiner();
        });

        it('should return a function', function () {
            const fn = combiner.createBuffered(() => {}, 5);

            expect(fn).to.be.a('function');
        });

        describe('number of executions', function () {
            it('should execute function after one call', function () {
                const fn       = this.sandbox.spy();
                const buffered = combiner.createBuffered(fn, 5);

                buffered();

                setTimeout(() => {
                    expect(fn).to.be.calledOnce;
                }, 10);
            });

            it('should execute function once after multiple calls', function () {
                const fn       = this.sandbox.spy();
                const buffered = combiner.createBuffered(fn, 5);

                buffered();
                buffered();
                buffered();
                buffered();

                setTimeout(() => {
                    expect(fn).to.be.calledOnce;
                }, 10);
            });
        });

        describe('scope', function () {
            it('should execute functions with buffered scope', function (done) {
                let scope;
                const scopeTest = {
                    fn () {
                        scope = this;
                    }
                };
                const fn        = this.sandbox.stub(scopeTest, 'fn').callThrough();
                const buffered  = combiner.createBuffered(fn, 5);

                buffered();

                setTimeout(() => {
                    expect(fn).to.be.calledOnce;
                    expect(scope).to.equal(combiner);

                    done();
                }, 10);
            });

            it('should execute functions with passed scope', function (done) {
                let scope;
                const scopeTest = {
                    fn () {
                        scope = this;
                    }
                };
                const fn        = this.sandbox.stub(scopeTest, 'fn').callThrough();
                const buffered  = combiner.createBuffered(fn, 5, scopeTest);

                buffered();

                setTimeout(() => {
                    expect(fn).to.be.calledOnce;
                    expect(scope).to.equal(scopeTest);

                    done();
                }, 10);
            });
        });

        describe('args', function () {
            it('should use inner args', function (done) {
                const fn       = this.sandbox.spy();
                const buffered = combiner.createBuffered(fn, 5);

                buffered('foo', 'bar');

                setTimeout(() => {
                    expect(fn).to.be.calledOnce;
                    expect(fn).to.be.calledWith('foo', 'bar');

                    done();
                }, 10);
            });

            it('should use inner args on last call', function (done) {
                const fn       = this.sandbox.spy();
                const buffered = combiner.createBuffered(fn, 5);

                buffered('foo', 'bar');
                buffered('bar', 'baz');

                setTimeout(() => {
                    expect(fn).to.be.calledOnce;
                    expect(fn).to.be.calledWith('bar', 'baz');

                    done();
                }, 10);
            });

            it('should use configured args', function (done) {
                const fn       = this.sandbox.spy();
                const buffered = combiner.createBuffered(fn, 5, null, [ 'bar', 'baz' ]);

                buffered('foo', 'bar');

                setTimeout(() => {
                    expect(fn).to.be.calledOnce;
                    expect(fn).to.be.calledWith('bar', 'baz');

                    done();
                }, 10);
            });
        });
    });

    describe('add', function () {
        beforeEach(function () {
            combiner = new Combiner();
        });

        it('should return a promise', function () {
            const promise = new Promise(resolve => resolve('bar'));

            combiner.add('foo', promise);

            expect(combiner).to.have.property('count', 1);

            return promise
                .then(() => {
                    expect(combiner).to.have.property('count', 0);
                });
        });

        it('should set data on promise resolution', function () {
            const promise = new Promise(resolve => resolve('bar'));

            combiner.add('foo', promise);

            return promise
                .then(() => {
                    expect(combiner).to.have.deep.property('data.foo', 'bar');
                });
        });

        it('should set error on promise rejection', function () {
            const error   = new Error();
            const promise = new Promise((resolve, reject) => reject(error));

            combiner.add('foo', promise);

            return promise
                .catch(() => {
                    expect(combiner).to.have.deep.property('hasError', error);
                });
        });

        it('should handle a deferred object', function () {
            const promise = new Promise(resolve => resolve('bar'));

            combiner.add('foo', {
                deferred : promise
            });

            return promise
                .then(() => {
                    expect(combiner).to.have.deep.property('data.foo', 'bar');
                });
        });
    });

    describe('onData', function () {
        beforeEach(function () {
            combiner = new Combiner();
        });

        it('should decrement count property', function () {
            combiner.count = 3;

            combiner.onData('foo', 'bar');

            expect(combiner).to.have.property('count', 2);
        });

        it('should set data', function () {
            combiner.onData('foo.bar', 'baz');

            expect(combiner).to.have.deep.property('data.foo.bar', 'baz');
        });
    });

    describe('onError', function () {
        beforeEach(function () {
            combiner = new Combiner();
        });

        it('should decrement count property', function () {
            combiner.count = 3;

            combiner.onError('foo', new Error());

            expect(combiner).to.have.property('count', 2);
        });

        it('should set hasError property to error', function () {
            const error = new Error();

            combiner.onError('foo', error);

            expect(combiner).to.have.property('hasError', error);
        });
    });

    describe('setData', function () {
        beforeEach(function () {
            combiner = new Combiner();
        });

        it('should handle an empty key array', function () {
            const key  = [];
            const root = {};

            combiner.setData(key, root, 'bar');

            expect(root).to.be.empty;
        });

        it('should set simple data', function () {
            const key  = [ 'foo' ];
            const root = {};

            combiner.setData(key, root, 'bar');

            expect(root).to.have.property('foo', 'bar');
        });

        it('should set nested data', function () {
            const key  = [ 'foo', 'bar' ];
            const root = {};

            combiner.setData(key, root, 'baz');

            expect(root).to.have.deep.property('foo.bar', 'baz');
        });

        it('should set simple data overriding existing data', function () {
            const key  = [ 'foo' ];
            const root = {
                foo : 'baz'
            };

            combiner.setData(key, root, 'bar');

            expect(root).to.have.property('foo', 'bar');
        });

        it('should set nested data overriding existing data', function () {
            const key  = [ 'foo', 'bar' ];
            const root = {
                foo : {
                    bar : 'foobar'
                }
            };

            combiner.setData(key, root, 'baz');

            expect(root).to.have.deep.property('foo.bar', 'baz');
        });

        it('should set data if it is an object', function () {
            const key  = [ 'foo', 'bar' ];
            const root = {
                foo : {
                    bar : 'foobar'
                }
            };

            combiner.setData(key, root, { foobar : true });

            expect(root).to.have.deep.property('foo.bar.foobar', true);
        });

        it('should merge objects', function () {
            const key  = [ 'foo', 'bar' ];
            const root = {
                foo : {
                    bar : {
                        foobar : false,
                        barbaz : 1
                    }
                }
            };

            combiner.setData(key, root, { foobar : true });

            expect(root).to.have.deep.property('foo.bar.foobar', true);
            expect(root).to.have.deep.property('foo.bar.barbaz', 1);
        });
    });
});
