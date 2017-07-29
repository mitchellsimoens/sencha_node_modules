const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Batch', function () {
        const test = index.Batch;

        expect(test).to.be.equal(require('../../Batch'));
    });

    it('should retrieve Connection', function () {
        const test = index.Connection;

        expect(test).to.be.equal(require('../../Connection'));
    });

    it('should retrieve DBable', function () {
        const test = index.DBable;

        expect(test).to.be.equal(require('../../DBable'));
    });

    it('should retrieve Manager', function () {
        const test = index.Manager;

        expect(test).to.be.equal(require('../../Manager'));
    });

    it('should retrieve Query', function () {
        const test = index.Query;

        expect(test).to.be.equal(require('../../Query'));
    });
});
