const { expect }            = require('chai');
const { Base, Managerable } = require('../../');

describe('Managerable', function () {
    let Cls, ClsArray, instance;

    beforeEach(function () {
        Cls = class extends Base {
            static get meta () {
                return {
                    mixins : [
                        Managerable
                    ]
                };
            }
        };

        Cls.decorate();

        ClsArray = class extends Base {
            static get meta () {
                return {
                    mixins : [
                        Managerable
                    ]
                };
            }

            static get baseInstance () {
                return {
                    beArray  : true,
                    cls      : Base,
                    property : 'isInstance'
                };
            }
        };

        ClsArray.decorate();
    });

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        Cls = ClsArray = instance = null;
    });

    describe('instantiation', function () {
        it('should be managerable', function () {
            instance = new Cls();

            expect(instance).to.have.property('isInstance',    true);
            expect(instance).to.have.property('isManagerable', true);
        });

        it('should set configs to defaults', function () {
            instance = new Cls();

            expect(instance).to.have.property('autoDestroy',       true);
            expect(instance).to.have.property('instancesProperty', '__$instances');
            expect(instance).to.have.property('nameProperty',      '__$name');
        });

        it('should set configs', function () {
            instance = new Cls({
                autoDestroy       : false,
                instancesProperty : '$foo',
                nameProperty      : '$bar'
            });

            expect(instance).to.have.property('autoDestroy',       false);
            expect(instance).to.have.property('instancesProperty', '$foo');
            expect(instance).to.have.property('nameProperty',      '$bar');
        });
    });

    describe('baseInstance', function () {
        it('should have cls', function () {
            const { cls } = Cls.baseInstance;

            expect(cls).to.equal(Base);
        });

        it('should have property', function () {
            const { property } = Cls.baseInstance;

            expect(property).to.equal('isInstance');
        });
    });

    describe('ctor', function () {
        it('should set map to default instancesProperty', function () {
            instance = new Cls();

            expect(instance).to.have.property('__$instances');
            expect(instance.__$instances).to.be.a('map');
        });

        it('should set map to configured instancesProperty', function () {
            instance = new Cls({
                instancesProperty : '$foo'
            });

            expect(instance).to.have.property('$foo');
            expect(instance.$foo).to.be.a('map');
        });

        it('should not create a map', function () {
            const map = new Map();

            instance = new Cls({
                __$instances : map
            });

            expect(instance).to.have.property('__$instances');
            expect(instance.__$instances).to.equal(map);
        });
    });

    describe('dtor', function () {
        it('should remove all instances', function () {
            instance = new Cls();

            const spy = this.sandbox.stub(instance, 'remove').callThrough();

            instance.add('foo', new Cls());

            instance.destroy();

            expect(spy).to.have.been.called;

            instance = null;
        });

        it('should nullify instanceProperty', function () {
            instance = new Cls();

            instance.add('foo', new Cls());

            instance.destroy();

            expect(instance).to.have.property('__$instances', null);

            instance = null;
        });
    });

    describe('add', function () {
        let foo, bar, baz;

        beforeEach(function () {
            foo = new Base();
            bar = new Base();
            baz = new Base();
        });

        afterEach(function () {
            if (foo) {
                foo.destroy();
            }

            if (bar) {
                bar.destroy();
            }

            if (baz) {
                baz.destroy();
            }

            foo = bar = baz = null;
        });

        describe('single', function () {
            beforeEach(function () {
                instance = new Cls();
            });

            it('should add an instance', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add('foo', foo);

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.equal(foo);
            });

            it('should should create map before adding an instance', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.__$instances = null;

                instance.add('foo', foo);

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.equal(foo);
            });

            it('should handle an object', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add({
                    foo
                });

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.equal(foo);
            });

            it('should handle an object with multiple instances', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add({
                    foo, bar, baz
                });

                expect(instance.__$instances.size).to.equal(3);
                expect(instance.__$instances.get('foo')).to.equal(foo);
                expect(instance.__$instances.get('bar')).to.equal(bar);
                expect(instance.__$instances.get('baz')).to.equal(baz);
            });

            it('should throw error if name already exists', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add('foo', foo);

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.equal(foo);

                const fn = () => {
                    instance.add('foo', bar);
                }

                expect(fn).to.throw(Error, 'Instance already exists: foo.');
            });

            it('should not throw error if instance already set', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add('foo', foo);

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.equal(foo);

                const fn = () => {
                    instance.add('foo', foo);
                }

                expect(fn).not.to.throw(Error);
            });

            it('should throw error if instance is destroyed', function () {
                expect(instance.__$instances.size).to.equal(0);

                foo.destroy();

                const fn = () => {
                    instance.add('foo', foo);
                }

                expect(fn).to.throw(Error, 'Instance is destroyed: foo.');
            });

            it('should create instance', function () {
                expect(instance.__$instances.size).to.equal(0);

                const config = {};

                instance.add('foo', config);

                expect(config.__$name).to.equal('foo');
                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.be.instanceOf(Base);
            });

            it('should create instance with no config', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add('foo');

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.be.instanceOf(Base);
            });
        });

        describe('array', function () {
            beforeEach(function () {
                instance = new ClsArray();
            });

            it('should create an array', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add('foo', foo);

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.be.an('array');
                expect(instance.__$instances.get('foo')).to.have.lengthOf(1);
                //expect(instance.__$instances.get('foo')).to.have.deep.property('[0]', foo);
                expect(instance.__$instances.get('foo')[0]).to.equal(foo);
            });

            it('should add instance to existing array', function () {
                expect(instance.__$instances.size).to.equal(0);

                instance.add('foo', foo);

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.be.an('array');
                expect(instance.__$instances.get('foo')).to.have.lengthOf(1);
                //expect(instance.__$instances.get('foo')).to.have.deep.property('[0]', foo);
                expect(instance.__$instances.get('foo')[0]).to.equal(foo);

                instance.add('foo', bar);

                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('foo')).to.be.an('array');
                expect(instance.__$instances.get('foo')).to.have.lengthOf(2);
                //expect(instance.__$instances.get('foo')).to.have.deep.property('[0]', foo);
                //expect(instance.__$instances.get('foo')).to.have.deep.property('[1]', bar);
                expect(instance.__$instances.get('foo')[0]).to.equal(foo);
                expect(instance.__$instances.get('foo')[1]).to.equal(bar);
            });
        })
    });

    describe('get', function () {
        let foo, bar, baz;

        beforeEach(function () {
            instance = new Cls();

            instance.add('foo', foo = new Base());
            instance.add('bar', bar = new Base());
            instance.add('baz', baz = new Base());
        });

        afterEach(function () {
            if (foo) {
                foo.destroy();
            }

            if (bar) {
                bar.destroy();
            }

            if (baz) {
                baz.destroy();
            }

            foo = bar = baz = null;
        });

        it('should get instance by name', function () {
            const result = instance.get('foo');

            expect(result).to.equal(foo);
        });

        it('should return instance that was passed', function () {
            const result = instance.get(foo);

            expect(result).to.equal(foo);
        });

        it('should return if was not a name or instance', function () {
            const test   = [];
            const result = instance.get(test);

            expect(result).to.equal(test);
        });

        it('should return instance map', function () {
            const result = instance.get();

            expect(result).to.be.a('map');
            expect(result).to.equal(instance.__$instances);
        });
    });

    describe('remove', function () {
        let foo, bar, baz;

        afterEach(function () {
            if (foo && !foo.destroyed) {
                foo.destroy();
            }

            if (bar && !bar.destroyed) {
                bar.destroy();
            }

            if (baz && !baz.destroyed) {
                baz.destroy();
            }

            foo = bar = baz = null;
        });

        describe('single', function () {
            beforeEach(function () {
                instance = new Cls();

                instance.add('foo', foo = new Base());
                instance.add('bar', bar = new Base());

                baz = new Base();
            });

            it('should remove instance by name', function () {
                expect(instance.__$instances.size).to.equal(2);

                instance.remove('foo');

                const result = instance.__$instances.get('foo');

                expect(result).to.be.undefined;
                expect(foo).to.have.property('destroyed', true);
                expect(instance.__$instances.size).to.equal(1);
            });

            it('should remove instance passing instance', function () {
                expect(instance.__$instances.size).to.equal(2);

                instance.remove(bar);

                const result = instance.__$instances.get('bar');

                expect(result).to.be.undefined;
                expect(bar).to.have.property('destroyed', true);
                expect(instance.__$instances.size).to.equal(1);
            });

            it('should not remove instance if item is not found', function () {
                expect(instance.__$instances.size).to.equal(2);

                instance.remove('baz');

                expect(instance.__$instances.size).to.equal(2);
            });

            it('should not destroy removed item', function () {
                expect(instance.__$instances.size).to.equal(2);

                instance.remove('foo', false);

                const result = instance.__$instances.get('foo');

                expect(result).to.be.undefined;
                expect(foo.destroyed).to.be.undefined;
                expect(instance.__$instances.size).to.equal(1);
            });
        });

        describe('array', function () {
            beforeEach(function () {
                instance = new ClsArray();

                instance.add('foo', foo = new Base());
                instance.add('bar', bar = new Base());
                instance.add('bar', baz = new Base());
            });

            it('should remove instance passing instance', function () {
                expect(instance.__$instances.size).to.equal(2);

                instance.remove(foo);

                const result = instance.__$instances.get('foo');

                expect(result).to.be.undefined;
                expect(foo).to.have.property('destroyed', true);
                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('bar')).to.not.be.undefined;
            });

            it('should not delete array if not empty', function () {
                expect(instance.__$instances.size).to.equal(2);
                expect(instance.__$instances.get('bar')).to.have.lengthOf(2);

                instance.remove(bar);

                expect(bar).to.have.property('destroyed', true);
                expect(instance.__$instances.size).to.equal(2);
                expect(instance.__$instances.get('foo')).to.not.be.undefined;
                expect(instance.__$instances.get('bar')).to.not.be.undefined;
                expect(instance.__$instances.get('bar')).to.have.lengthOf(1);
            });

            it('should not destroy removed item', function () {
                expect(instance.__$instances.size).to.equal(2);

                instance.remove(foo, false);

                const result = instance.__$instances.get('foo');

                expect(result).to.be.undefined;
                expect(foo.destroyed).to.be.undefined;
                expect(instance.__$instances.size).to.equal(1);
                expect(instance.__$instances.get('bar')).to.not.be.undefined;
            });
        });
    });
});
