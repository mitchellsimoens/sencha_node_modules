const { expect }  = require('chai');
const { Adapter } = require('../../../operation');

describe('Adapter', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Adapter();
        });

        it('should be an adapter', function () {
            expect(instance).to.have.property('isAdapter', true);
        });
    });

    describe('operations', function () {
        beforeEach(function () {
            instance = new Adapter();
        });

        it('should have an operations object', function () {
            expect(instance).to.have.property('operations');
            expect(instance.operations).to.be.an('object');
            expect(instance.operations).to.be.empty;
        });
    });

    describe('getOperation', function () {
        beforeEach(function () {
            instance = this.createAdapter();
        });

        it('should get operation by loading from rootPath', function () {
            const operation = instance.getOperation('foo.bar');

            expect(operation).to.be.a('function');
        });

        it('should return if an operation is passed', function () {
            const cls       = this.getOperation('foo.bar');
            const operation = instance.getOperation(cls);

            expect(operation).to.equal(cls);
        });
    });

    describe('instantiateOperation', function () {
        let operation;

        beforeEach(function () {
            instance = this.createAdapter();
        });

        afterEach(function () {
            if (operation) {
                operation.destroy();
                operation = null;
            }
        });

        it('should instantiate operation when string is passed', function () {
            operation = instance.instantiateOperation('foo.bar');

            expect(operation).to.have.property('isInstance',  true);
            expect(operation).to.have.property('isOperation', true);
        });

        it('should instantiate operation when class is passed', function () {
            const cls = this.getOperation('foo.bar');

            operation = instance.instantiateOperation(cls);

            expect(operation).to.have.property('isInstance',  true);
            expect(operation).to.have.property('isOperation', true);
        });
    });
});
