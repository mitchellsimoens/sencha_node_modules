const { expect } = require('chai');

const { error : { FatalError } } = require('../../../');

describe('FatalError', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new FatalError();
        });

        it('should call superclass', function () {
            expect(instance).to.have.property('name', 'FatalError');
        });

        it('should be an error', function () {
            expect(instance).to.be.an('error');
        });

        it('should be a fatal error', function () {
            expect(instance).to.have.property('isFatal', true);
        });
    });

    describe('isFatal', function () {
        it('should be recognized as fatal', function () {
            instance = new FatalError();

            const isFatal = FatalError.isFatal(instance);

            expect(isFatal).to.be.true;
        });

        it('should not be a fatal error', function () {
            instance = new Error();

            const isFatal = FatalError.isFatal(instance);

            expect(isFatal).to.be.false;
        });
    });
});
