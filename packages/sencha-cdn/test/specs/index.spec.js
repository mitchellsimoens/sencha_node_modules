const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Cdn', function () {
        const test = index.Cdn;

        expect(test).to.be.equal(require('../../Cdn'));
    });
});
