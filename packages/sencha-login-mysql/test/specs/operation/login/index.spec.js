const { expect } = require('chai');
const index      = require('../../../../operation/login');

describe('/index.js', function () {
    it('should retrieve get', function () {
        const test = index.get;

        expect(test).to.be.equal(require('../../../../operation/login/get'));
    });
});
