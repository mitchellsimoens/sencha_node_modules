const { expect } = require('chai');
const index      = require('../../../event/');

describe('/index.js', function () {
    it('should retrieve Listener', function () {
        const test = index.Listener;

        expect(test).to.be.equal(require('../../../event/Listener'));
    });

    it('should retrieve Observable', function () {
        const test = index.Observable;

        expect(test).to.be.equal(require('../../../event/Observable'));
    });
});
