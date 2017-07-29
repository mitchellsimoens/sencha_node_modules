const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Connection', function () {
        const test = index.Connection;

        expect(test).to.be.equal(require('../../Connection'));
    });

    it('should retrieve Manager', function () {
        const test = index.Manager;

        expect(test).to.be.equal(require('../../Manager'));
    });
});
