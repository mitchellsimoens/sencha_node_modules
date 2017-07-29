const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve AWS', function () {
        const test = index.AWS;

        expect(test).to.be.equal(require('../../AWS'));
    });

    it('should retrieve S3', function () {
        const test = index.S3;

        expect(test).to.be.equal(require('../../S3'));
    });
});
