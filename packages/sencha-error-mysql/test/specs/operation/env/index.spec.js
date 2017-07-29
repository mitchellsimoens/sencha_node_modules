const { expect } = require('chai');
const index      = require('../../../../operation/env');

describe('/operation/env/index.js', function () {
    it('should retrieve save', function () {
        const test = index.save;

        expect(test).to.be.equal(require('../../../../operation/env/save'));
    });
});
