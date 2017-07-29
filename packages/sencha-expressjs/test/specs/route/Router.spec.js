const { expect }             = require('chai');
const { route : { Router } } = require('../../../');

describe('Sencha.express.route.Router', function() {
    let router;

    afterEach(function () {
        if (router && !router.destroyed) {
            router.destroy();
        }

        router = null;
    });

    describe('instantiation', function() {
        it('should be a router', function() {
            router = new Router();

            expect(router).to.have.property('isExpressRouter', true);
        });
    });
});
