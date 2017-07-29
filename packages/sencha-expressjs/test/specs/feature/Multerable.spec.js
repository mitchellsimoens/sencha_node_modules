const { expect }                           = require('chai');
const { Server, feature : { Multerable } } = require('../../../');

class TestServer extends Server {
    static get meta () {
        return {
            mixins : [
                Multerable
            ]
        };
    }
}

describe('feature.Multerable', function() {
    describe('mixed into', function() {
        let server;

        beforeEach(function() {
            server = new TestServer();
        });

        afterEach(function() {
            if (server && !server.destroyed) {
                server.destroy();
            }

            server = null;
        });

        it('should be mixed in', function() {
            expect(server).to.have.property('isMulterable', true);
        });
    });
});
