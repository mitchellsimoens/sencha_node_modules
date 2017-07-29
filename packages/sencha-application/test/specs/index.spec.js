const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Application', function () {
        const test = index.Application;

        expect(test).to.be.equal(require('../../Application'));
    });

    it('should retrieve Controller', function () {
        const test = index.Controller;

        expect(test).to.be.equal(require('../../Controller'));
    });
});
