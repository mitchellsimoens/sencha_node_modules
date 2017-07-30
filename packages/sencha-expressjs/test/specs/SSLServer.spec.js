const { expect }    = require('chai');
const { Config }    = require('@extjs/sencha-core');
const { SSLServer } = require('../../');

describe('SSLServer', function() {
    let certificates, server;

    beforeEach(function () {
        certificates = {
            cert : this[ 'sencha-expressjs' ].getAssetLocation('localhost.crt', Config.appRoot),
            key  : this[ 'sencha-expressjs' ].getAssetLocation('localhost.key', Config.appRoot)
        };
    });

    afterEach(function() {
        if (server && !server.destroyed) {
            server.destroy();
        }

        certificates = server = null;
    });

    describe('instantiation', function() {
        it('should be server', function() {
            server = new SSLServer();

            expect(server).to.have.property('isExpressSSLServer', true);
        });

        it('should not auto start', function() {
            server = new SSLServer();

            expect(server.server).to.be.undefined;
            //use _app to not trigger the getter app method
            expect(server._app).to.be.undefined;
        });

        it('should start express but not auto listen', function() {
            server = new SSLServer({
                autoListen : false,
                autoStart  : true
            });

            expect(server.server).to.be.undefined;
            expect(server.listening).to.be.undefined;
        });

        it('should start and listen', function(done) {
            server = new SSLServer({
                autoStart    : true,
                host         : 'foo.com',
                port         : 3000,
                certificates : Object.assign({}, certificates)
            });

            setTimeout(function() {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });

    describe('start', function() {
        it('should start manually but not listen', function() {
            server = new SSLServer({
                autoListen : false
            });

            server.start();

            expect(server._app).to.be.a('function');
            expect(server.server).to.be.undefined;
            expect(server.listening).to.be.undefined;
        });

        it('should start manually and listen', function(done) {
            server = new SSLServer({
                host         : 'foo.com',
                port         : 3000,
                certificates : Object.assign({}, certificates)
            });

            server.start();

            setTimeout(function() {
                expect(server._app).to.be.a('function');
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });

        it('should not start due to certificate issue', function() {
            server = new SSLServer({
                host : 'foo.com',
                port : 3000
            });

            let fn = function() {
                server.start();
            };

            expect(fn).to.throw(/NPNProtocols/);
        });
    });

    describe('listen', function() {
        it('should listen manually', function(done) {
            server = new SSLServer({
                autoListen   : false,
                autoStart    : true,
                host         : 'foo.com',
                port         : 3000,
                certificates : Object.assign({}, certificates)
            });

            server.listen();

            setTimeout(function() {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });
});
