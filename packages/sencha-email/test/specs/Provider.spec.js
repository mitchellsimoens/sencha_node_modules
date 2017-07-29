const { expect }   = require('chai');
const { Provider } = require('../../');

describe('Provider', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Provider();
        });

        it('should be a provider', function () {
            expect(instance).to.have.property('isEmailProvider', true);
        });
    });

    describe('send', function () {
        beforeEach(function () {
            instance = new Provider();
        });

        it('should throw an error', function () {
            const fn = () => {
                instance.send();
            };

            expect(fn).to.throw(Error, 'Abstract provider cannot send emails');
        });
    });
});
