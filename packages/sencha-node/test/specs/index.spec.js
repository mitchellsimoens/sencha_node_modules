const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Shutdown', function () {
        const test = index.Shutdown;

        expect(test).to.be.equal(require('../../Shutdown'));
    });
});
