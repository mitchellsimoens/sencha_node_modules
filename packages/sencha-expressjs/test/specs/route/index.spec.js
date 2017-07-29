const { expect } = require('chai');
const index      = require('../../../route/');

describe('/route/index.js', function () {
    it('should retrieve BaseRoute', function () {
        const test = index.BaseRoute;

        expect(test).to.be.equal(require('../../../route/BaseRoute'));
    });

    it('should retrieve ProxyRoute', function () {
        const test = index.ProxyRoute;

        expect(test).to.be.equal(require('../../../route/ProxyRoute'));
    });

    it('should retrieve Route', function () {
        const test = index.Route;

        expect(test).to.be.equal(require('../../../route/Route'));
    });

    it('should retrieve Router', function () {
        const test = index.Router;

        expect(test).to.be.equal(require('../../../route/Router'));
    });

    it('should retrieve Routerable', function () {
        const test = index.Routerable;

        expect(test).to.be.equal(require('../../../route/Routerable'));
    });

    it('should retrieve SimpleRoute', function () {
        const test = index.SimpleRoute;

        expect(test).to.be.equal(require('../../../route/SimpleRoute'));
    });

    it('should retrieve UglifyRoute', function () {
        const test = index.UglifyRoute;

        expect(test).to.be.equal(require('../../../route/UglifyRoute'));
    });
});
