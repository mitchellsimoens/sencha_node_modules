const { expect } = require('chai');
const index      = require('../../../lib/error/index.js');

describe('lib/error/index.js', function () {
    it('should retrieve ExtendableError', function () {
        const test = index.ExtendableError;

        expect(test).to.be.equal(require('../../../lib/error/ExtendableError'));
    });

    it('should retrieve FatalError', function () {
        const test = index.FatalError;

        expect(test).to.be.equal(require('../../../lib/error/FatalError'));
    });
});
