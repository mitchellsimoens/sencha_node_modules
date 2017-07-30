const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Auth', function () {
        const test = index.Auth;

        expect(test).to.be.equal(require('../../Auth'));
    });
});
