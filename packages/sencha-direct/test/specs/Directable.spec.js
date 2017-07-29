const { expect } = require('chai');

const { Base }                = require('@extjs/sencha-core');
const { Directable, Manager } = require('./../../');

describe('Sencha.direct.Directable', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('meta', function () {
        it('should return isDirectable property', function () {
            const { meta } = Directable;

            expect(Object.keys(meta)).to.have.lengthOf(1);
            expect(meta).to.have.property('prototype');
            expect(meta.prototype).to.be.an('object');
            expect(meta.prototype).to.not.be.empty;

            expect(Object.keys(meta.prototype)).to.have.lengthOf(1);
            expect(meta).to.have.deep.property('prototype.isDirectable', true);
        });

        it('should mix into class', function () {
            class Foo extends Base {
                static get meta () {
                    return {
                        mixins : [
                            Directable
                        ]
                    };
                }
            }

            instance = new Foo();

            expect(instance).to.have.property('isDirectable', true);
        });
    });

    describe('direct', function () {
        beforeEach(function () {
            class Foo extends Base {
                static get meta () {
                    return {
                        mixins : [
                            Directable
                        ]
                    };
                }
            }

            instance = new Foo();
        });

        afterEach(function () {
            delete Manager.foo;
        });

        it('should get providers from manager', function () {
            expect(instance.direct).to.equal(Manager.get());
        });

        it('should set config onto manager', function () {
            instance.direct = {
                foo : 'bar'
            };

            expect(Manager.foo).to.equal('bar');
        });

        it('should not set config onto manager', function () {
            instance.direct = null;

            expect(Manager.foo).to.be.undefined;
        });
    });
});
