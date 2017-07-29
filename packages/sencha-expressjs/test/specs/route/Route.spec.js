const { expect }            = require('chai');
const { route : { Route } } = require('../../../');

describe('Sencha.express.route.Route', function() {
    let route;

    afterEach(function () {
        if (route && !route.destroyed) {
            route.destroy();
        }

        route = null;
    });

    describe('instantiation', function() {
        it('should be a route', function() {
            route = new Route();

            expect(route).to.have.property('isExpressRoute', true);
        });
    });
});
