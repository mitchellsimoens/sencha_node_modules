const { expect } = require('chai');
const index      = require('../../../combiner/');

describe('/index.js', function () {
    it('should retrieve Error', function () {
        const test = index.Error;

        expect(test).to.be.equal(require('../../../combiner/Error'));
    });
});
