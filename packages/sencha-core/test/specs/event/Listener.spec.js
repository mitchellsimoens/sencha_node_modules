const { expect } = require('chai');

const { Base, event : { Listener, Observable } } = require('../../../');

describe('Sencha.core.event.Listener', function () {
    let Cls, instance, listener;

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

        if (listener) {
            listener.destroy();
            listener = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should set observable', function () {
            listener = new Listener(instance);

            expect(listener).to.have.property('owner', instance);
        });

        it('should set options', function () {
            const options = {
                single : true
            };

            listener = new Listener(instance, options);

            expect(listener).to.have.property('options', options);
            expect(listener.options).to.have.deep.property('single', true);
        });

        it('should set listenFns', function () {
            listener = new Listener(instance);

            expect(listener).to.have.property('listenFns');
            expect(listener.listenFns).to.be.an('object');
        });

        it('should process a nested listener', function () {
            const fn = () => {};
            const options = {
                foo    : {
                    fn
                }
            };

            listener = new Listener(instance, options);

            expect(listener).to.have.property('options', options);
            expect(listener.listenFns).to.have.deep.property('foo', fn);
        })
    });

    describe('doAdd', function () {
        beforeEach(function () {
            instance = new Cls();
            listener = new Listener(instance);
        });

        it('should add listener', function () {
            const fn = () => {};

            listener.doAdd('foo', fn);

            expect(listener.listenFns).to.have.deep.property('foo', fn);
        });

        describe('options', function () {
            it('should add a "buffer" listener', function () {
                const fn  = () => {};
                const spy = this.sandbox.spy(listener, 'wrapBuffer');

                listener.doAdd('foo', fn, {
                    buffer : 10
                });

                expect(listener.listenFns).to.have.deep.property('foo');
                expect(spy).to.have.been.called;
            });

            it('should add a "delay" listener', function () {
                const fn  = () => {};
                const spy = this.sandbox.spy(listener, 'wrapDelay');

                listener.doAdd('foo', fn, {
                    delay : 500
                });

                expect(listener.listenFns).to.have.deep.property('foo');
                expect(spy).to.have.been.called;
            });

            it('should add a "single" listener', function () {
                const fn  = () => {};
                const spy = this.sandbox.spy(listener, 'wrapSingle');

                listener.doAdd('foo', fn, {
                    single : true
                });

                expect(listener.listenFns).to.have.deep.property('foo');
                expect(spy).to.have.been.called;
            });
        });

        describe('subOptions', function () {
            it('should add a "buffer" listener with sub options', function () {
                const fn  = () => {};
                const spy = this.sandbox.spy(listener, 'wrapBuffer');

                listener.doAdd('foo', fn, undefined, {
                    buffer : 10
                });

                expect(listener.listenFns).to.have.deep.property('foo');
                expect(spy).to.have.been.called;
            });

            it('should add a "delay" listener with sub options', function () {
                const fn  = () => {};
                const spy = this.sandbox.spy(listener, 'wrapDelay');

                listener.doAdd('foo', fn, undefined, {
                    delay : 500
                });

                expect(listener.listenFns).to.have.deep.property('foo');
                expect(spy).to.have.been.called;
            });

            it('should add a "single" listener with sub options', function () {
                const fn  = () => {};
                const spy = this.sandbox.spy(listener, 'wrapSingle');

                listener.doAdd('foo', fn, undefined, {
                    single : true
                });

                expect(listener.listenFns).to.have.deep.property('foo');
                expect(spy).to.have.been.called;
            });

            it('should accept scope in sub options', function () {
                const fn  = () => {};
                const scope = {
                    testMe : fn
                };

                listener.doAdd('foo', 'testMe', undefined, {
                    scope
                });

                expect(listener.listenFns).to.have.deep.property('foo');
            });
        });
    });

    describe('doRemove', function () {
        beforeEach(function () {
            instance = new Cls();
            listener = new Listener(instance);
        });

        it('should remove listener', function () {
            listener.doAdd('foo', () => {});

            expect(listener.listenFns).to.have.deep.property('foo');

            listener.doRemove('foo');

            expect(listener.listenFns).to.have.deep.property('foo', null);
        });

        it('should not remove non-added listener', function () {
            listener.doAdd('foo', () => {});

            expect(listener.listenFns).to.have.deep.property('foo');

            listener.doRemove('bar');

            expect(listener.listenFns).to.have.deep.property('foo');
        });
    });

    describe('wrapBuffer', function () {
        beforeEach(function () {
            instance = new Cls();
            listener = new Listener(instance);
        });

        it('should wrap function', function () {
            const fn       = () => {};
            const buffered = listener.wrapBuffer(fn, 100);

            expect(buffered).to.be.a('function');
        });

        it('should execute buffered function', function (done) {
            const fn       = this.sandbox.spy();
            const buffered = listener.wrapBuffer(fn, 5);

            buffered();

            setTimeout(() => {
                expect(fn).to.have.been.called;

                done();
            }, 10);
        });

        it('should execute buffered function once', function (done) {
            const fn       = this.sandbox.spy();
            const buffered = listener.wrapBuffer(fn, 5);

            buffered();
            buffered();

            setTimeout(() => {
                expect(fn).to.have.been.calledOnce;

                done();
            }, 10);
        });

        it('should execute buffered function with arguments', function (done) {
            const fn       = this.sandbox.spy();
            const buffered = listener.wrapBuffer(fn, 5);

            buffered('foo');

            setTimeout(() => {
                fn.should.have.been.calledWith('foo');

                done();
            }, 10);
        });

        it('should execute buffered function with multiple arguments', function (done) {
            const fn       = this.sandbox.spy();
            const buffered = listener.wrapBuffer(fn, 5);

            buffered('foo', 'bar');

            setTimeout(() => {
                fn.should.have.been.calledWith('foo', 'bar');

                done();
            }, 10);
        });

        it('should execute with last passed arguments', function (done) {
            const fn       = this.sandbox.spy();
            const buffered = listener.wrapBuffer(fn, 5);

            buffered('foo');
            buffered('bar');

            setTimeout(() => {
                expect(fn).to.have.been.calledOnce;
                fn.should.have.been.calledWith('bar');

                done();
            }, 10);
        });
    });

    describe('wrapDelay', function () {
        beforeEach(function () {
            instance = new Cls();
            listener = new Listener(instance);
        });

        it('should wrap function', function () {
            const fn      = () => {};
            const delayed = listener.wrapDelay(fn, 100);

            expect(delayed).to.be.a('function');
        });

        it('should execute fn after delay', function (done) {
            const fn      = this.sandbox.spy();
            const delayed = listener.wrapDelay(fn, 5);

            delayed();

            expect(fn).to.not.have.been.called;

            setTimeout(() => {
                expect(fn).to.have.been.calledOnce;

                done();
            }, 10);
        });

        it('should pass argument to fn execution', function (done) {
            const fn      = this.sandbox.spy();
            const delayed = listener.wrapDelay(fn, 5);

            delayed('foo');

            expect(fn).to.not.have.been.called;

            setTimeout(() => {
                fn.should.have.been.calledWith('foo');

                done();
            }, 10);
        });

        it('should pass multiple arguments to fn execution', function (done) {
            const fn      = this.sandbox.spy();
            const delayed = listener.wrapDelay(fn, 5);

            delayed('foo', 'bar', 'baz');

            expect(fn).to.not.have.been.called;

            setTimeout(() => {
                fn.should.have.been.calledWith('foo', 'bar', 'baz');

                done();
            }, 10);
        });
    });

    describe('wrapSingle', function () {
        beforeEach(function () {
            instance = new Cls();
            listener = new Listener(instance);
        });

        it('should wrap function', function () {
            const fn      = () => {};
            const wrapped = listener.wrapSingle('foo', fn);

            expect(wrapped).to.be.a('function');
        });

        it('should remove function after executing', function () {
            const fn      = this.sandbox.spy();
            const wrapped = listener.wrapSingle('foo', fn);

            listener.doAdd('foo', wrapped);

            expect(listener.listenFns).to.have.deep.property('foo', wrapped);

            wrapped();

            expect(listener.listenFns).to.have.deep.property('foo', null);
        });
    });
});
