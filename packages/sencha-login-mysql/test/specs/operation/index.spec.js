const { expect } = require('chai');
const index      = require('../../../operation');

describe('/operation/index.js', function () {
    it('should retrieve forum', function () {
        const test = index.forum;

        expect(test).to.be.equal(require('../../../operation/forum'));
    });

    it('should retrieve login', function () {
        const test = index.login;

        expect(test).to.be.equal(require('../../../operation/login'));
    });

    it('should retrieve sencha', function () {
        const test = index.sencha;

        expect(test).to.be.equal(require('../../../operation/sencha'));
    });
});
