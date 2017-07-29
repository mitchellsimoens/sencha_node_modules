const { expect } = require('chai');
const index      = require('../../../../operation/location');

describe('/operation/location/index.js', function () {
    it('should retrieve save', function () {
        const test = index.save;

        expect(test).to.be.equal(require('../../../../operation/location/save'));
    });
});
