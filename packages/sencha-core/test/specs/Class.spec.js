const { expect }            = require('chai');
const { Base, Class, ClassMixin } = require('../../');

describe('Sencha.core.Class', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('instantiate', function () {
        beforeEach(function () {
            instance = new Class({
                foo : 'bar'
            });
        });

        it('should be an instance', function () {
            expect(instance).to.have.property('isInstance', true);
        });

        it('should be inititialized', function () {
            expect(instance).to.have.property('initializing', false);
            expect(instance).to.have.property('initialized',  true);
        });

        it('should have $config', function () {
            expect(instance.$config).to.be.a('object');
        });

        it('should apply config', function () {
            expect(instance).to.have.property('foo', 'bar');
        });

        it('should reconfigure', function () {
            instance.reconfigure({
                foo : 'baz'
            });

            expect(instance).to.have.property('foo', 'baz');
        });

        it('should reconfigure $config', function () {
            instance.reconfigure({
                foo : 'baz'
            });

            expect(instance.$config).to.have.property('foo', 'baz');
        });
    });

    describe('default properties', function () {
        describe('isInstance', function () {
            it('should set isInstance', function () {
                const instance = new Class();

                expect(instance).to.have.property('isInstance', true);
            });
        });

        describe('emptyFn', function () {
            it('should have static emptyFn', function () {
                expect(Class).to.have.property('emptyFn');
                expect(Class.emptyFn).to.be.a('function');

                Class.emptyFn();
            });

            it('should have instance emptyFn', function () {
                const instance = new Class();

                expect(instance).to.have.property('emptyFn', Class.emptyFn);
                expect(instance.emptyFn).to.be.a('function');

                instance.emptyFn();
            });
        });

        describe('identityFn', function () {
            it('should have static identityFn', function () {
                expect(Class).to.have.property('identityFn');
                expect(Class.identityFn).to.be.a('function');

                const ret = Class.identityFn('foo');

                expect(ret).to.equal('foo');
            });

            it('should have instance identityFn', function () {
                const instance = new Class();

                expect(instance).to.have.property('identityFn', Class.identityFn);
                expect(instance.identityFn).to.be.a('function');

                const ret = instance.identityFn('foo');

                expect(ret).to.equal('foo');
            });
        });
    });

    describe('destroy', function () {
        it('should be destroyed', function () {
            let instance = new Class();

            instance.destroy();

            expect(instance).to.have.property('destroying', false);
            expect(instance).to.have.property('destroyed',  true);

            instance = null;
        });
    });

    describe('ctor and dtor', function () {
        it('should not override ctor', function () {
            const fn = Class.emptyFn;

            instance = new Class({
                ctor : fn
            });

            expect(instance.ctor).to.not.equal(fn);
        });

        it('should not override dtor', function () {
            let fn = Class.emptyFn;

            instance = new Class({
                dtor : fn
            });

            expect(instance.dtor).to.not.equal(fn);
        });

        it('should execute ctor', function () {
            const spy = this.sandbox.spy();

            class Foo extends ClassMixin(Class) {
                ctor () {
                    spy.apply(this, arguments);
                }
            }

            Foo.decorate();

            const config = {
                foo : true
            };

            instance = new Foo(config);

            spy.should.have.been.calledWith(config);
        });

        it('should execute dtor', function () {
            const spy = this.sandbox.spy();

            class Foo extends ClassMixin(Class) {
                dtor () {
                    spy.apply(this, arguments);
                }
            }

            Foo.decorate();

            instance = new Foo();

            instance.destroy();

            instance = null;

            expect(spy).to.have.been.called;
        });
    });

    describe('watchers', function () {
        describe('on definition', function () {
            it('should add watcher', function () {
                Class.addWatcher('foo', Class.emptyFn);

                expect(Class._watchers.foo).to.have.length(1);
            });

            it('should remove watcher', function () {
                Class.removeWatcher('foo', Class.emptyFn);

                expect(Class._watchers.foo).to.equal(undefined);
            });

            it('should execute watcher', function () {
                const spy = this.sandbox.spy();

                Class.addWatcher('foo', spy);

                Class.triggerWatchers('foo');

                Class.removeWatcher('foo', spy);

                expect(spy).to.have.been.called;
            });

            it('should NOT execute watcher', function () {
                const spy = this.sandbox.spy();

                Class.addWatcher('foo', spy);

                Class.triggerWatchers('bar');

                Class.removeWatcher('foo', spy);

                expect(spy).to.not.have.been.called;
            });
        });

        describe('on instance', function () {
            beforeEach(function () {
                instance = new Class();
            });

            it('should execute watcher', function () {
                let spy = this.sandbox.spy();

                Class.addWatcher('foo', spy);

                instance.triggerWatchers('foo');

                Class.removeWatcher('foo', spy);

                expect(spy).to.have.been.called;
            });

            it('should NOT execute watcher', function () {
                let spy = this.sandbox.spy();

                Class.addWatcher('foo', spy);

                instance.triggerWatchers('bar');

                Class.removeWatcher('foo', spy);

                expect(spy).to.not.have.been.called;
            });
        });

        describe('built-in triggers', function () {
            let cls;

            beforeEach(function () {
                cls = class extends Class {};
            });

            afterEach(function () {
                cls = null;
            });

            describe('contructor triggers', function () {
                it('should trigger before-constructor', function () {
                    const spy    = this.sandbox.spy();
                    const config = {};

                    cls.addWatcher('before-constructor', spy);

                    instance = new cls(config);

                    spy.should.have.been.calledWith(config, instance, 'before-constructor', cls);
                });

                it('should trigger after-constructor', function () {
                    const spy  = this.sandbox.spy();

                    cls.addWatcher('after-constructor', spy);

                    instance = new cls();

                    spy.should.have.been.calledWith(instance, 'after-constructor', cls);
                });
            });

            describe('ctor triggers', function () {
                it('should trigger before-ctor', function () {
                    const spy    = this.sandbox.spy();
                    const config = {};

                    cls.addWatcher('before-ctor', spy);

                    instance = new cls(config);

                    spy.should.have.been.calledWith(config, instance, 'before-ctor', cls);
                });

                it('should trigger after-ctor', function () {
                    const spy = this.sandbox.spy();

                    cls.addWatcher('after-ctor', spy);

                    instance = new cls();

                    spy.should.have.been.calledWith(instance, 'after-ctor', cls);
                });
            });

            describe('dtor triggers', function () {
                it('should trigger before-dtor', function () {
                    const spy = this.sandbox.spy();

                    cls.addWatcher('before-dtor', spy);

                    instance = new cls();

                    instance.destroy();

                    spy.should.have.been.calledWith(instance, 'before-dtor', cls);

                    instance = null;
                });

                it('should trigger after-dtor', function () {
                    const spy = this.sandbox.spy();

                    cls.addWatcher('after-dtor', spy);

                    instance = new cls();

                    instance.destroy();

                    spy.should.have.been.calledWith(instance, 'after-dtor', cls);

                    instance = null;
                });
            });
        });
    });

    describe('merge', function () {
        it('should return an object', function () {
            const obj = Class.merge();

            expect(obj).to.be.an('object');
            expect(obj).to.be.empty;
        });

        describe('shallow', function () {
            it('should merge two objects', function () {
                const obj = Class.merge(
                    {
                        foo : 'bar'
                    },
                    {
                        bar : 'baz'
                    }
                );

                expect(obj).to.have.property('foo', 'bar');
                expect(obj).to.have.property('bar', 'baz');
            });

            it('should merge three objects', function () {
                const obj = Class.merge(
                    {
                        foo : 'bar'
                    },
                    {
                        bar : 'baz'
                    },
                    {
                        baz : 'foobar'
                    }
                );

                expect(obj).to.have.property('foo', 'bar');
                expect(obj).to.have.property('bar', 'baz');
                expect(obj).to.have.property('baz', 'foobar');
            });

            it('should overwrite matching keys', function () {
                const obj = Class.merge(
                    {
                        foo : 'bar'
                    },
                    {
                        foo : 'baz'
                    }
                );

                expect(obj).to.have.property('foo', 'baz');
            });

            it('should overwrite matching keys with three objects', function () {
                const obj = Class.merge(
                    {
                        foo : 'bar'
                    },
                    {
                        foo : 'baz'
                    },
                    {
                        foo : 'foobar'
                    }
                );

                expect(obj).to.have.property('foo', 'foobar');
            });

            it('should overwrite a simple value with a complex value', function () {
                const obj = Class.merge(
                    {
                        foo : 'bar'
                    },
                    {
                        foo : {
                            baz : 'foobar'
                        }
                    }
                );

                expect(obj.foo).to.have.deep.property('baz', 'foobar');
            });

            it('should apply array on non-existing key', function () {
                const obj = Class.merge(
                    {},
                    {
                        foo : [ 1, 2 ]
                    }
                );

                expect(obj).to.have.property('foo');

                expect(obj.foo).to.be.an('array').that.includes(1, 2);
            });
        });

        describe('array', function () {
            it('should concat matching arrays', function () {
                const obj = Class.merge(
                    {
                        foo : [ 1, 2 ]
                    },
                    {
                        foo : [ 3, 4 ]
                    }
                );

                expect(obj).to.have.property('foo');

                expect(obj.foo).to.be.an('array').that.includes(1, 2, 3, 4);
            });
        });
    });

    describe('addWatcher', function () {
        afterEach(function () {
            Class._watchers = null;
        });

        it('should add a watcher', function () {
            const fn = () => {};

            Class.addWatcher('foo', fn);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);
        });

        it('should add a new watcher', function () {
            const fn = () => {};

            Class.addWatcher('foo', fn);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);

            const fn2 = () => {};

            Class.addWatcher('bar', fn2);

            expect(Class._watchers).to.have.deep.property('bar');
            expect(Class._watchers.bar).to.be.an('array').that.includes(fn2);
            expect(Class._watchers.bar).to.have.lengthOf(1);
        });

        it('should add another watcher', function () {
            const fn = () => {};

            Class.addWatcher('foo', fn);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);

            const fn2 = () => {};

            Class.addWatcher('foo', fn2);

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn2);
            expect(Class._watchers.foo).to.have.lengthOf(2);
        });
    });

    describe('removeWatcher', function () {
        afterEach(function () {
            Class._watchers = null;
        });

        it('should remove a watcher', function () {
            const fn = () => {};

            Class.addWatcher('foo', fn);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);

            Class.removeWatcher('foo', fn);

            expect(Class._watchers).to.not.have.deep.property('foo');
        });

        it('should not remove unknown watcher name', function () {
            const fn = () => {};

            Class.addWatcher('foo', fn);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);

            Class.removeWatcher('bar', fn);

            expect(Class._watchers).to.have.deep.property('foo');
        });

        it('should not remove watcher with unknown function', function () {
            const fn  = () => {};
            const fn2 = () => {}

            Class.addWatcher('foo', fn);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);

            Class.removeWatcher('foo', fn2);

            expect(Class._watchers).to.have.deep.property('foo');
        });

        it('should remove watcher but keep other watcher', function () {
            const fn  = () => {};
            const fn2 = () => {}

            Class.addWatcher('foo', fn);
            Class.addWatcher('foo', fn2);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(2);

            Class.removeWatcher('foo', fn2);

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);
        });
    });

    describe('removeWatchers', function () {
        afterEach(function () {
            Class._watchers = null;
        });

        it('should remove all watchers', function () {
            const fn  = () => {};
            const fn2 = () => {};

            Class.addWatcher('foo', fn);
            Class.addWatcher('bar', fn2);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);

            expect(Class._watchers).to.have.deep.property('bar');
            expect(Class._watchers.bar).to.be.an('array').that.includes(fn2);
            expect(Class._watchers.bar).to.have.lengthOf(1);

            Class.removeWatchers();

            expect(Class._watchers).to.not.have.deep.property('foo');
            expect(Class._watchers).to.not.have.deep.property('bar');
        });

        it('should remove all name watchers', function () {
            const fn  = () => {};
            const fn2 = () => {};

            Class.addWatcher('foo', fn);
            Class.addWatcher('bar', fn2);

            expect(Class).to.have.property('_watchers');
            expect(Class._watchers).to.be.an('object');

            expect(Class._watchers).to.have.deep.property('foo');
            expect(Class._watchers.foo).to.be.an('array').that.includes(fn);
            expect(Class._watchers.foo).to.have.lengthOf(1);

            expect(Class._watchers).to.have.deep.property('bar');
            expect(Class._watchers.bar).to.be.an('array').that.includes(fn2);
            expect(Class._watchers.bar).to.have.lengthOf(1);

            Class.removeWatchers('foo');

            expect(Class._watchers).to.not.have.deep.property('foo');
            expect(Class._watchers).to.have.deep.property('bar');
        });
    });

    describe('config', function () {
        describe('applier', function () {
            it('should execute applier', function () {
                let executed;

                class Cls extends Class {
                    applyFoo (...args) {
                        executed = args;
                        return args[0];
                    }
                }

                new Cls({
                    foo : 'bar'
                });

                expect(executed).to.be.an('array');
                expect(executed).to.have.lengthOf(2);
                //expect(executed).to.have.deep.property('[0]', 'bar');
                //expect(executed).to.have.deep.property('[1]', undefined);
                expect(executed[0]).to.equal('bar');
                expect(executed[1]).to.equal(undefined);
            });
        });
    });

    describe('callChain', function () {
        it('should call chain with one function', function () {
            let executed;

            class superclass extends Base {
                foo () {
                    executed = true;
                }
            }

            class subclass extends superclass {}

            const instance = new subclass();

            instance.callChain('foo');

            expect(executed).to.be.true;
        });

        it('should call chain with an argument', function () {
            let executed;

            class superclass extends Base {
                foo (...args) {
                    executed = args;
                }
            }

            class subclass extends superclass {}

            const instance = new subclass();

            instance.callChain('foo', false, 'foo');

            expect(executed).to.be.an('array');
            expect(executed).to.have.lengthOf(1);
            expect(executed).that.includes('foo');
        });

        it('should call chain with an array of arguments', function () {
            let executed;

            class superclass extends Base {
                foo (...args) {
                    executed = args;
                }
            }

            class subclass extends superclass {}

            const instance = new subclass();

            instance.callChain('foo', false, [ 'foo', 'bar' ]);

            expect(executed).to.be.an('array');
            expect(executed).to.have.lengthOf(2);
            //expect(executed).to.have.deep.property('[0]', 'foo');
            //expect(executed).to.have.deep.property('[1]', 'bar');
            expect(executed[0]).to.equal('foo');
            expect(executed[1]).to.equal('bar');
        });

        it('should call a chain in order', function () {
            const executed = [];

            class superclass extends Base {
                foo () {
                    executed.push('superclass');
                }
            }

            class subclass extends superclass {
                foo () {
                    executed.push('subclass');
                }
            }

            const instance = new subclass();

            instance.callChain('foo');

            expect(executed).to.be.an('array');
            expect(executed).to.have.lengthOf(2);
            //expect(executed).to.have.deep.property('[0]', 'superclass');
            //expect(executed).to.have.deep.property('[1]', 'subclass');
            expect(executed[0]).to.equal('superclass');
            expect(executed[1]).to.equal('subclass');
        });

        it('should call a chain in reverse order', function () {
            const executed = [];

            class superclass extends Base {
                foo () {
                    executed.push('superclass');
                }
            }

            class subclass extends superclass {
                foo () {
                    executed.push('subclass');
                }
            }

            const instance = new subclass();

            instance.callChain('foo', true);

            expect(executed).to.be.an('array');
            expect(executed).to.have.lengthOf(2);
            //expect(executed).to.have.deep.property('[0]', 'subclass');
            //expect(executed).to.have.deep.property('[1]', 'superclass');
            expect(executed[0]).to.equal('subclass');
            expect(executed[1]).to.equal('superclass');
        });
    });

    describe('reconfigure', function () {
        it('should set config', function () {
            const instance = new Class({
                foo : 'bar'
            });

            instance.reconfigure({
                foo : 'baz',
                bar : 'foo'
            });

            expect(instance).to.have.property('foo', 'baz');
            expect(instance).to.have.property('bar', 'foo');
        });

        it('should not set config', function () {
            const instance = new Class({
                foo : 'bar'
            });

            instance.reconfigure();

            expect(instance).to.have.property('foo', 'bar');
        });
    });
});
