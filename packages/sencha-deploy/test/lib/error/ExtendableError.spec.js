const { expect } = require('chai');

const { error : { ExtendableError } } = require('../../../');

describe('ExtendableError', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        it('should be an error', function () {
            instance = new ExtendableError('foo');

            expect(instance).to.be.an('error');
        });

        it('should have a name', function () {
            instance = new ExtendableError('foo');

            expect(instance).to.have.property('name', 'ExtendableError');
        });

        it('should have a message', function () {
            instance = new ExtendableError('foo');

            expect(instance).to.have.property('message', 'foo');
        });

        it('should have a stack trace', function () {
            const oldCaptureStack = Error.captureStackTrace;

            Error.captureStackTrace = null;

            instance = new ExtendableError('foo');

            expect(instance).to.have.property('stack');
            expect(instance.stack).to.be.a('string');

            Error.captureStackTrace = oldCaptureStack;
        });

        it('should capture stack trace', function () {
            const stub = this.sandbox.stub(Error, 'captureStackTrace');

            instance = new ExtendableError('foo');

            expect(stub).to.be.calledOnce;
        });
    });
});
