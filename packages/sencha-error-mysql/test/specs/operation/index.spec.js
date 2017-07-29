const { expect } = require('chai');
const index      = require('../../../operation');

describe('/operation/index.js', function () {
    it('should retrieve env', function () {
        const test = index.env;

        expect(test).to.be.equal(require('../../../operation/env'));
    });

    it('should retrieve error', function () {
        const test = index.error;

        expect(test).to.be.equal(require('../../../operation/error'));
    });

    it('should retrieve location', function () {
        const test = index.location;

        expect(test).to.be.equal(require('../../../operation/location'));
    });
});
