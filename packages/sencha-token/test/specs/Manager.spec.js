const chai   = require('chai');
const expect = chai.expect;

const Manager = require('../../Manager');

describe('Manager', function() {
    afterEach(function() {
        Manager.adapter = null;
    });

    it('should be token manager', function() {
        expect(Manager).to.be.have.property('isTokenManager', true);
    });

    describe('Operationable', function () {
        it('should be operationable', function() {
            expect(Manager).to.be.have.property('isOperationable', true);
        });
    });
});
