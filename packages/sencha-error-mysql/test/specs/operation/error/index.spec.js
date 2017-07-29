const { expect } = require('chai');
const index      = require('../../../../operation/error');

describe('/operation/error/index.js', function () {
    it('should retrieve save', function () {
        const test = index.save;

        expect(test).to.be.equal(require('../../../../operation/error/save'));
    });
});
