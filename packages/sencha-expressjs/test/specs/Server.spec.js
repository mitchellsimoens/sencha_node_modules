const { expect } = require('chai');
const { Server } = require('../../');

describe('Server', function() {
    let server;

    afterEach(function() {
        if (server && !server.destroyed) {
            server.destroy();
        }

        server = null;
    });

    describe('instantiation', function() {
        it('should be server', function() {
            server = new Server();

            expect(server).to.have.property('isExpressServer', true);
        });

        it('should not auto start', function() {
            server = new Server();

            expect(server.server).to.be.undefined;
            //use _app to not trigger the getter app method
            expect(server._app).to.be.undefined;
        });

        it('should start express but not auto listen', function() {
            server = new Server({
                autoListen : false,
                autoStart  : true
            });

            expect(server.server).to.be.undefined;
            expect(server.listening).to.be.undefined;
        });

        it('should start and listen', function(done) {
            server = new Server({
                autoStart : true,
                host      : 'foo.com',
                port      : 3000
            });

            setTimeout(function() {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });

    describe('start', function() {
        it('should start manually but not listen', function() {
            server = new Server({
                autoListen : false
            });

            server.start();

            expect(server._app).to.be.a('function');
            expect(server.server).to.be.undefined;
            expect(server.listening).to.be.undefined;
        });

        it('should start manually and listen', function(done) {
            server = new Server({
                host : 'foo.com',
                port : 3000
            });

            server.start();

            setTimeout(function() {
                expect(server._app).to.be.a('function');
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });

    describe('listen', function() {
        it('should listen manually', function(done) {
            server = new Server({
                autoListen : false,
                autoStart  : true,
                host       : 'foo.com',
                port       : 3000
            });

            server.listen();

            setTimeout(function() {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });
});
