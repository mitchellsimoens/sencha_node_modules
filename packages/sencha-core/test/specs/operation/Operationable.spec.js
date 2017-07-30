const { expect }                              = require('chai');
const { Base, operation : { Operationable } } = require('../../..');

describe('Operationable', function () {
    let Cls, instance, operation;

    beforeEach(function () {
        Cls = class extends Base {
            static get meta () {
                return {
                    mixins : [
                        Operationable
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

        if (operation) {
            operation.destroy();
            operation = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should get mixed into class', function () {
            expect(instance).to.have.property('isInstance',      true);
            expect(instance).to.have.property('isOperationable', true);
        });
    });

    describe('getOperation', function () {
        beforeEach(function () {
            instance = new Cls();

            instance.adapter = this[ 'sencha-core' ].createAdapter();
        });

        it('should get operation passing a string', function () {
            const operation = instance.getOperation('foo.bar');

            expect(operation).to.be.a('function');
        });

        it('should return if an operation is passed', function () {
            const cls       = this[ 'sencha-core' ].getOperation('foo.bar');
            const operation = instance.getOperation(cls);

            expect(operation).to.equal(cls);
        });
    });

    describe('instantiateOperation', function () {
        beforeEach(function () {
            instance = new Cls();

            instance.adapter = this[ 'sencha-core' ].createAdapter();
        });

        it('should instantiate operation when string is passed', function () {
            operation = instance.instantiateOperation('foo.bar');

            expect(operation).to.have.property('isInstance',  true);
            expect(operation).to.have.property('isOperation', true);
        });

        it('should instantiate operation when class is passed', function () {
            const cls = this[ 'sencha-core' ].getOperation('foo.bar');

            operation = instance.instantiateOperation(cls);

            expect(operation).to.have.property('isInstance',  true);
            expect(operation).to.have.property('isOperation', true);
        });
    });
});
