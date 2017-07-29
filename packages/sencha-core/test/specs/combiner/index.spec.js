const { expect } = require('chai');
const index      = require('../../../combiner/');

describe('/index.js', function () {
    it('should retrieve Combiner', function () {
        const test = index.Combiner;

        expect(test).to.be.equal(require('../../../combiner/Combiner'));
    });
});
