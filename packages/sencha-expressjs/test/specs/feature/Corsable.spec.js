const { expect }                         = require('chai');
const { Server, feature : { Corsable } } = require('../../../');

class TestServer extends Server {
    static get meta () {
        return {
            mixins : [
                Corsable
            ]
        };
    }
}

describe('feature.Corsable', () => {
    describe('mixed into', () => {
        let server;

        beforeEach(() => {
            server = new TestServer();
        });

        afterEach(() => {
            if (server && !server.destroyed) {
                server.destroy();
            }

            server = null;
        });

        it('should be mixed in', () => {
            expect(server).to.have.property('isCorsable', true);
        });
    });
});
