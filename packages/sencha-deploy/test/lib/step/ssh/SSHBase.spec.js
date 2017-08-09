const { expect } = require('chai');

const { step : { ssh : { SSHBase } } } = require('../../../../');

describe('SSHBase', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        it('should save config', function () {
            instance = new SSHBase({
                foo : 'bar'
            });

            //expect(instance).to.have.deep.property('config.foo', 'bar');
            expect(instance.config).to.have.property('foo', 'bar');
        });

        it('should save empty object', function () {
            instance = new SSHBase();

            expect(instance.config).to.be.an('object');
            expect(instance.config).to.be.empty;
        });
    });
});
