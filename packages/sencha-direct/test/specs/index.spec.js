const { expect } = require('chai');
const index      = require('../../index.js');

describe('/index.js', function () {
    it('should retrieve Action', function () {
        const test = index.Action;

        expect(test).to.be.equal(require('../../Action'));
    });

    it('should retrieve Directable', function () {
        const test = index.Directable;

        expect(test).to.be.equal(require('../../Directable'));
    });

    it('should retrieve Manager', function () {
        const test = index.Manager;

        expect(test).to.be.equal(require('../../Manager'));
    });

    it('should retrieve Provider', function () {
        const test = index.Provider;

        expect(test).to.be.equal(require('../../Provider'));
    });

    it('should retrieve route', function () {
        const test = index.route;

        expect(test).to.be.equal(require('../../route'));
    });
});
