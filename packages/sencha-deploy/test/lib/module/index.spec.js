const { expect } = require('chai');
const index      = require('../../../lib/module/index.js');

describe('lib/module/index.js', function () {
    it('should retrieve nightly', function () {
        const test = index.nightly;

        expect(test).to.be.equal(require('../../../lib/module/Nightly'));
    });

    it('should retrieve Nightly', function () {
        const test = index.Nightly;

        expect(test).to.be.equal(require('../../../lib/module/Nightly'));
    });

    it('should retrieve release', function () {
        const test = index.release;

        expect(test).to.be.equal(require('../../../lib/module/Release'));
    });

    it('should retrieve Release', function () {
        const test = index.Release;

        expect(test).to.be.equal(require('../../../lib/module/Release'));
    });
});
