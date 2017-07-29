const { expect } = require('chai');
const index      = require('../../../../operation/forum');

describe('/index.js', function () {
    it('should retrieve get', function () {
        const test = index.get;

        expect(test).to.be.equal(require('../../../../operation/forum/get'));
    });

    it('should retrieve save', function () {
        const test = index.save;

        expect(test).to.be.equal(require('../../../../operation/forum/save'));
    });
});
