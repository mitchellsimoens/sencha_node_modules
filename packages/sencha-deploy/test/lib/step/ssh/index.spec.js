const { expect } = require('chai');
const index      = require('../../../../lib/step/ssh/index.js');

describe('lib/step/ssh/index.js', function () {
    it('should retrieve SSHBase', function () {
        const test = index.SSHBase;

        expect(test).to.be.equal(require('../../../../lib/step/ssh/SSHBase'));
    });

    it('should retrieve SSHExtract', function () {
        const test = index.SSHExtract;

        expect(test).to.be.equal(require('../../../../lib/step/ssh/SSHExtract'));
    });

    it('should retrieve SSHPrepare', function () {
        const test = index.SSHPrepare;

        expect(test).to.be.equal(require('../../../../lib/step/ssh/SSHPrepare'));
    });

    it('should retrieve SSHRunner', function () {
        const test = index.SSHRunner;

        expect(test).to.be.equal(require('../../../../lib/step/ssh/SSHRunner'));
    });

    it('should retrieve SSHUpload', function () {
        const test = index.SSHUpload;

        expect(test).to.be.equal(require('../../../../lib/step/ssh/SSHUpload'));
    });
});
