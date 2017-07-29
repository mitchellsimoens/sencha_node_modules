const { expect }     = require('chai');
const { Controller } = require('../../');

describe('Controller', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Controller();
        });

        it('should be a controller', function () {
            expect(instance).to.have.property('isController', true);
        });

        it('should be an observable', function () {
            expect(instance).to.have.property('isObservable', true);
        });
    });
});
