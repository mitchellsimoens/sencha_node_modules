const { expect } = require('chai');
const { Server } = require('../../');

const http = require('http');

describe('Server', () => {
    let server;

    afterEach(() => {
        if (server && !server.destroyed) {
            server.destroy();
        }

        server = null;
    });

    describe('instantiation', () => {
        it('should be server', () => {
            server = new Server();

            expect(server).to.have.property('isExpressServer', true);
        });

        it('should not auto start', () => {
            server = new Server();

            expect(server.server).to.be.undefined;
            // use _app to not trigger the getter app method
            expect(server._app).to.be.undefined;
        });

        it('should start express but not auto listen', () => {
            server = new Server({
                autoListen : false,
                autoStart  : true
            });

            expect(server.server).to.be.instanceof(http.Server);
            expect(server.listening).to.be.undefined;
        });

        it('should start and listen', done => {
            server = new Server({
                autoStart : true,
                host      : 'foo.com',
                port      : 3000
            });

            setTimeout(() => {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });

    describe('start', () => {
        it('should start manually but not listen', () => {
            server = new Server({
                autoListen : false
            });

            server.start();

            expect(server._app).to.be.a('function');
            expect(server.server).to.be.instanceof(http.Server);
            expect(server.listening).to.be.undefined;
        });

        it('should start manually and listen', done => {
            server = new Server({
                host : 'foo.com',
                port : 3000
            });

            server.start();

            setTimeout(() => {
                expect(server._app).to.be.a('function');
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });

    describe('listen', () => {
        it('should listen manually', done => {
            server = new Server({
                autoListen : false,
                autoStart  : true,
                host       : 'foo.com',
                port       : 3000
            });

            server.listen();

            setTimeout(() => {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });
});
