const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Console', function () {
        const test = index.Console;

        expect(test).to.be.equal(require('../../Console'));
    });
});
