const { expect } = require('chai');
const index      = require('../../../lib/transfer/index.js');

describe('lib/transfer/index.js', function () {
    it('should retrieve Base', function () {
        const test = index.Base;

        expect(test).to.be.equal(require('../../../lib/transfer/Base'));
    });

    it('should retrieve Rsync', function () {
        const test = index.Rsync;

        expect(test).to.be.equal(require('../../../lib/transfer/Rsync'));
    });

    it('should retrieve SCP2', function () {
        const test = index.SCP2;

        expect(test).to.be.equal(require('../../../lib/transfer/SCP2'));
    });

    it('should retrieve SSH', function () {
        const test = index.SSH;

        expect(test).to.be.equal(require('../../../lib/transfer/SSH'));
    });
});
