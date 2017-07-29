const { expect } = require('chai');
const index      = require('../../');

describe('/index.js', function () {
    it('should retrieve Adapter', function () {
        const test = index.Adapter;

        expect(test).to.be.equal(require('../../Adapter'));
    });

    it('should retrieve combiner', function () {
        const test = index.combiner;

        expect(test).to.be.equal(require('../../combiner'));
    });

    it('should retrieve Forum', function () {
        const test = index.Forum;

        expect(test).to.be.equal(require('../../Forum'));
    });

    it('should retrieve Login', function () {
        const test = index.Login;

        expect(test).to.be.equal(require('../../Login'));
    });

    it('should retrieve Manager', function () {
        const test = index.Manager;

        expect(test).to.be.equal(require('../../Manager'));
    });

    it('should retrieve Sencha', function () {
        const test = index.Sencha;

        expect(test).to.be.equal(require('../../Sencha'));
    });
});
