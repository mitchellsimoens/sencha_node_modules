const { expect }                             = require('chai');
const { Server, feature : { SocketIOable } } = require('../../../');

class TestServer extends Server {
    static get meta () {
        return {
            mixins : [
                SocketIOable
            ]
        };
    }
}

describe('feature.SocketIOable', function() {
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
            expect(server).to.have.property('isSocketIOable', true);
        });
    });
});
