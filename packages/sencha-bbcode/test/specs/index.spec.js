const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve BBCode', function () {
        const test = index.BBCode;

        expect(test).to.be.equal(require('../../BBCode'));
    });

    it('should retrieve TagInfo', function () {
        const test = index.TagInfo;

        expect(test).to.be.equal(require('../../TagInfo'));
    });
});
