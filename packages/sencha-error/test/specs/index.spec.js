const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Adapter', function () {
        const test = index.Adapter;

        expect(test).to.be.equal(require('../../Adapter'));
    });

    it('should retrieve combiner', function () {
        const test = index.combiner;

        expect(test).to.be.equal(require('../../combiner'));
    });

    it('should retrieve Error', function () {
        const test = index.Error;

        expect(test).to.be.equal(require('../../Error'));
    });

    it('should retrieve Manager', function () {
        const test = index.Manager;

        expect(test).to.be.equal(require('../../Manager'));
    });
});
