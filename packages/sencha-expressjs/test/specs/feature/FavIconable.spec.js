const { expect }                            = require('chai');
const { Server, feature : { FavIconable } } = require('../../../');

class TestServer extends Server {
    static get meta () {
        return {
            mixins : [
                FavIconable
            ]
        };
    }
}

describe('feature.FavIconable', function() {
    describe('mixed into', function() {
        let server;

        beforeEach(function() {
            server = new TestServer({
                favicon : this.getAssetLocation('favicon.ico')
            });
        });

        afterEach(function() {
            if (server && !server.destroyed) {
                server.destroy();
            }

            server = null;
        });

        it('should be mixed in', function() {
            expect(server).to.have.property('isFavIconable', true);
        });
    });
});
