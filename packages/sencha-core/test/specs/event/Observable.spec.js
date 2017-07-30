const { expect } = require('chai');

const { Base, event : { Observable } } = require('../../../');

describe('Sencha.core.event.Observable', function () {
    let Cls, instance;

    beforeEach(function () {
        Cls = class extends Base {
            static get meta () {
                return {
                    mixins : [
                        Observable
                    ]
                };
            }
        }

        Cls.decorate();
    });

    afterEach(function () {
        Cls = null;

        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('mixed into class', function () {
        it('should be an observable', function () {
            expect(Cls.prototype.isObservable).to.be.true;
        });

        it('should have an on method', function () {
            expect(Cls.prototype.on).to.be.a('function');
        });

        it('should have an un method', function () {
            expect(Cls.prototype.un).to.be.a('function');
        });

        it('should have a fire method', function () {
            expect(Cls.prototype.fire).to.be.a('function');
        });
    });

    describe('on', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should add listener using separate arguments', function () {
            instance.on('foo', instance.emptyFn);

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });

        it('should add listener using separate arguments with scope', function () {
            instance.on('foo', instance.emptyFn, instance);

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });

        it('should add listener using event string and object', function () {
            instance.on('foo', {
                fn    : instance.emptyFn,
                scope : instance
            });

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });

        it('should add listener using event string and object with scope outside', function () {
            instance.on('foo', {
                fn : instance.emptyFn
            }, instance);

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });

        it('should add listener using event string and object with string fn with scope outside', function () {
            instance.on('foo', {
                fn : 'emptyFn'
            }, instance);

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });

        it('should add listener using object', function () {
            instance.on({
                foo : instance.emptyFn
            });

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });

        it('should add listener with function as a string', function () {
            const scope = {
                fn : instance.emptyFn
            };

            instance.on('foo', 'fn', scope);

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });

        it('should add listener with function as a string in an object', function () {
            const scope = {
                fn : instance.emptyFn
            };

            instance.on({
                scope,
                foo   : 'fn'
            });

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });
    });

    describe('un', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should remove listener using separate arguments', function () {
            instance.on('foo', instance.emptyFn);
            instance.un('foo', instance.emptyFn);

            expect(instance.getListenerCount('foo')).to.be.equal(0);
        });

        it('should remove listener using object', function () {
            instance.on({
                foo : instance.emptyFn
            });
            instance.un({
                foo : instance.emptyFn
            });

            expect(instance.getListenerCount('foo')).to.be.equal(0);
        });

        it('should do nothing if already destroyed', function () {
            instance.on({
                foo : instance.emptyFn
            });

            instance.destroy();

            instance.un({
                foo : instance.emptyFn
            });

            expect(instance).to.have.property('destroyed', true);

            instance = null;
        });
    });

    describe('fire', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        describe('simple', function () {
            it('should be listened', function () {
                const spy = this.sandbox.spy();

                instance.on('foo', spy);

                instance.fire('foo');

                expect(spy).to.have.been.called;
            });

            it('should be listened using an object', function () {
                const spy = this.sandbox.spy();

                instance.on({
                    foo : spy
                });

                instance.fire('foo');

                expect(spy).to.have.been.called;
            });

            it('should be listened using an object and function as a string', function () {
                const spy   = this.sandbox.spy();
                const scope = {
                    fn : spy
                };

                instance.on({
                    scope,
                    foo : 'fn'
                });

                instance.fire('foo');

                expect(spy).to.have.been.called;
            });

            it('should be listened using an object with sender', function () {
                const spy = this.sandbox.spy();

                instance.on({
                    foo : spy
                });

                instance.fire({
                    type   : 'foo',
                    sender : instance
                });

                expect(spy).to.have.been.called;
            });
        });

        describe('promise', function () {
            it('should return promise', function () {
                const ret = instance.fire({
                    type : 'foo'
                });

                expect(ret).to.be.a('promise');
            });

            it('should pass resolve in listener signature', function () {
                instance.on({
                    foo : event => {
                        expect(event.resolve).to.be.a('function');
                    }
                });

                instance.fire('foo');
            });

            it('should pass reject in listener signature', function () {
                instance.on({
                    foo : event => {
                        expect(event.reject).to.be.a('function');
                    }
                });

                instance.fire('foo');
            });

            it('should resolve promise', function () {
                const spy = this.sandbox.spy(ret => {
                    expect(ret).to.have.equal('good');
                });

                instance.on({
                    foo : event => {
                        event.resolve('good');
                    }
                });

                return instance
                    .fire('foo')
                    .then(spy);
            });

            it('should resolve if no listeners', function () {
                const spy = this.sandbox.spy(ret => {
                    expect(ret).to.be.undefined;
                });

                expect(instance.getListenerCount('foo')).to.be.equal(0);

                return instance
                    .fire('foo')
                    .then(spy);
            });

            it('should reject promise', function () {
                const spy = this.sandbox.spy(ret => {
                    expect(ret).to.be.instanceof(Error);
                });

                instance.on({
                    foo : event => {
                        event.reject(new Error('bad!'));
                    }
                });

                return instance
                    .fire('foo')
                    .then(spy, spy);
            });
        });

        describe('with data passed', function () {
            it('should be listened', function () {
                const spy = this.sandbox.spy();

                instance.on('foo', spy);

                instance.fire({
                    type : 'foo',
                    data : 'hello'
                });

                expect(spy).to.have.been.called;
            });

            it('should be listened using an object', function () {
                const spy = this.sandbox.spy();

                instance.on({
                    foo : spy
                });

                instance.fire({
                    type : 'foo',
                    data : 'hello'
                });

                expect(spy).to.have.been.called;
            });

            it('should be listened using an object and function as a string', function () {
                const spy = this.sandbox.spy();
                const obj = {
                    fn : spy
                };

                instance.on({
                    scope : obj,
                    foo   : 'fn'
                });

                instance.fire({
                    type : 'foo',
                    data : 'hello'
                });

                expect(spy).to.have.been.called;
            });
        });

        describe('single', function () {
            it('should be listened', function () {
                const spy = this.sandbox.spy();

                instance.on({
                    single : true,
                    foo    : spy
                });

                instance.fire('foo');

                expect(spy).to.have.been.called;
            });

            it('should be listened only once', function () {
                const spy = this.sandbox.spy();

                instance.on({
                    single : true,
                    foo    : spy
                });

                instance.fire('foo');
                instance.fire('foo');

                spy.should.have.been.calledOnce;
            });
        });

        describe('buffer', function () {
            it('should be listened', function (done) {
                const spy = this.sandbox.spy();

                instance.on({
                    buffer : 10,
                    foo    : spy
                });

                instance.fire('foo');

                setTimeout(() => {
                    spy.should.have.been.calledOnce;

                    done();
                }, 15);
            });

            it('should be listened only once', function (done) {
                const spy = this.sandbox.spy();

                instance.on({
                    buffer : 10,
                    foo    : spy
                });

                instance.fire('foo');
                instance.fire('foo');

                setTimeout(() => {
                    spy.should.have.been.calledOnce;

                    done();
                }, 15);
            });

            it('should be listened twice', function (done) {
                const spy = this.sandbox.spy();

                instance.on({
                    buffer : 10,
                    foo    : spy
                });

                instance.fire('foo');
                instance.fire('foo');

                setTimeout(() => {
                    spy.should.have.been.calledOnce;

                    instance.fire('foo');

                    setTimeout(() => {
                        spy.should.have.been.calledTwice;

                        done();
                    }, 15);
                }, 15);
            });
        });

        describe('delay', function () {
            it('should be listened', function (done) {
                const spy = this.sandbox.spy();

                instance.on({
                    delay : 10,
                    foo   : spy
                });

                instance.fire('foo');

                setTimeout(() => {
                    spy.should.have.been.calledOnce;

                    done();
                }, 15);
            });

            it('should be listened twice', function (done) {
                const spy = this.sandbox.spy();

                instance.on({
                    delay : 10,
                    foo   : spy
                });

                instance.fire('foo');
                instance.fire('foo');

                setTimeout(() => {
                    spy.should.have.been.calledTwice;

                    done();
                }, 15);
            });
        });
    });

    describe('attach on class instantiation', function () {
        it('should have listener', function () {
            const instance = new Cls({
                listeners : {
                    foo : Cls.emptyFn
                }
            });

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });
        it('should have listener when defined as an object', function () {
            const instance = new Cls({
                listeners : {
                    foo : {
                        fn : Cls.emptyFn
                    }
                }
            });

            expect(instance.getListenerCount('foo')).to.be.equal(1);
        });
    });

    describe('remove listeners on class destroy', function () {
        it('should not have any listeners', function () {
            const instance = new Cls({
                listeners : {
                    foo : Cls.emptyFn
                }
            });

            instance.destroy();

            expect(instance.$emitter).to.be.null;
        });
    });
});
