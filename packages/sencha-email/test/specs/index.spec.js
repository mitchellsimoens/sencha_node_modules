const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Email', function () {
        const test = index.Email;

        expect(test).to.be.equal(require('../../Email'));
    });

    it('should retrieve Manager', function () {
        const test = index.Manager;

        expect(test).to.be.equal(require('../../Manager'));
    });

    it('should retrieve Provider', function () {
        const test = index.Provider;

        expect(test).to.be.equal(require('../../Provider'));
    });
});
