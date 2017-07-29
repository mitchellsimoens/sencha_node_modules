const { expect } = require('chai');
const index      = require('../../../operation');

describe('/index.js', function () {
    it('should retrieve Adapter', function () {
        const test = index.Adapter;

        expect(test).to.be.equal(require('../../../operation/Adapter'));
    });

    it('should retrieve Operation', function () {
        const test = index.Operation;

        expect(test).to.be.equal(require('../../../operation/Operation'));
    });

    it('should retrieve Operationable', function () {
        const test = index.Operationable;

        expect(test).to.be.equal(require('../../../operation/Operationable'));
    });
});
