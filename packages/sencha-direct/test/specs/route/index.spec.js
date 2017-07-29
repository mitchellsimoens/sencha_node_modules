const { expect } = require('chai');
const index      = require('../../../route/index.js');

describe('/route/index.js', function () {
    it('should retrieve Express', function () {
        const test = index.Express;

        expect(test).to.be.equal(require('../../../route/Express'));
    });

    it('should retrieve Mixin', function () {
        const test = index.Mixin;

        expect(test).to.be.equal(require('../../../route/Mixin'));
    });
});
