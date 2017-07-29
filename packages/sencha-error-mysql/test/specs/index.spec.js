const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Adapter', function () {
        const test = index.Adapter;

        expect(test).to.be.equal(require('../../Adapter'));
    });

    it('should retrieve operation', function () {
        const test = index.operation;

        expect(test).to.be.equal(require('../../operation'));
    });
});
