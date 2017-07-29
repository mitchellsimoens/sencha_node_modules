const { expect } = require('chai');
const { Base }   = require('../../');

describe('Sencha.core.Base', function () {
    describe('instantiate', function () {
        let instance;

        beforeEach(function () {
            instance = new Base();
        });

        afterEach(function () {
            instance.destroy();
            instance = null;
        });

        it('should be an instance', function () {
            expect(instance.isInstance).to.be.true;
        });
    });

    describe('meta.mixins', function () {
        let cls, mixin;

        beforeEach(function () {
            mixin = class extends Base {
                foo () {}
            }

            cls = class extends Base {
                static get meta () {
                    return {
                        mixins : [
                            mixin
                        ]
                    };
                }
            };

            cls.decorate();
        });

        afterEach(function () {
            cls = mixin = null;
        });

        it('should have mixin', function () {
            expect(cls.prototype).to.have.property('foo');
            expect(cls.prototype.foo).to.be.a('function');
        });
    });

    describe('meta.prototype', function () {
        it('should apply property', function () {
            class Foo extends Base {
                static get meta () {
                    return {
                        prototype : {
                            foo : 'bar'
                        }
                    };
                }
            };

            Foo.decorate();

            expect(Foo.prototype).to.have.property('foo', 'bar');
        });

        it('should merge objects on instantiation', function () {
            class Foo extends Base {
                static get meta () {
                    return {
                        prototype : {
                            config : {
                                foo : {
                                    bar : false,
                                    baz : false
                                }
                            }
                        }
                    };
                }
            };

            let instance = new Foo({
                foo : {
                    bar : true
                }
            });

            expect(instance).to.have.property('foo');
            expect(instance.foo).to.have.property('bar', true);
            expect(instance.foo).to.have.property('baz', false);

            instance.destroy();
        });
    });

    describe('static construct', function () {
        it('should create an instance', function () {
            const Cls = Base.construct(Base);

            expect(Cls).to.be.instanceOf(Base);
        });

        it('should create an instance with one arg', function () {
            const Cls = Base.construct(Base, [ 'foo' ]);

            expect(Cls).to.be.instanceOf(Base);
        });

        it('should create an instance with two args', function () {
            const Cls = Base.construct(Base, [ 'foo', 'bar' ]);

            expect(Cls).to.be.instanceOf(Base);
        });
    });

    describe('static create', function () {
        it('should create an instance with no arguments', function () {
            const Cls = Base.create();

            expect(Cls).to.be.instanceOf(Base);
        });
    });
});
