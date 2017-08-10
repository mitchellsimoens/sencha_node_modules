const { expect }    = require('chai');
const { Config }    = require('@extjs/sencha-core');
const { SSLServer } = require('../../');

const https = require('https');

describe('SSLServer', () => {
    let certificates, server;

    beforeEach(function () {
        certificates = {
            cert : this[ 'sencha-expressjs' ].getAssetLocation('localhost.crt', Config.appRoot),
            key  : this[ 'sencha-expressjs' ].getAssetLocation('localhost.key', Config.appRoot)
        };
    });

    afterEach(() => {
        if (server && !server.destroyed) {
            server.destroy();
        }

        certificates = null;
        server = null;
    });

    describe('instantiation', () => {
        it('should be server', () => {
            server = new SSLServer();

            expect(server).to.have.property('isExpressSSLServer', true);
        });

        it('should not auto start', () => {
            server = new SSLServer();

            expect(server.server).to.be.undefined;
            // use _app to not trigger the getter app method
            expect(server._app).to.be.undefined;
        });

        it('should start express but not auto listen', () => {
            server = new SSLServer({
                autoListen   : false,
                autoStart    : true,
                certificates : Object.assign({}, certificates)
            });

            expect(server.server).to.be.instanceof(https.Server);
            expect(server.listening).to.be.undefined;
        });

        it('should start and listen', done => {
            server = new SSLServer({
                autoStart    : true,
                certificates : Object.assign({}, certificates),
                host         : 'foo.com',
                port         : 3000
            });

            setTimeout(() => {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });

    describe('start', () => {
        it('should start manually but not listen', () => {
            server = new SSLServer({
                autoListen   : false,
                certificates : Object.assign({}, certificates)
            });

            server.start();

            expect(server._app).to.be.a('function');
            expect(server.server).to.be.instanceof(https.Server);
            expect(server.listening).to.be.undefined;
        });

        it('should start manually and listen', done => {
            server = new SSLServer({
                certificates : Object.assign({}, certificates),
                host         : 'foo.com',
                port         : 3000
            });

            server.start();

            setTimeout(() => {
                expect(server._app).to.be.a('function');
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });

        it('should not start due to certificate issue', () => {
            server = new SSLServer({
                host : 'foo.com',
                port : 3000
            });

            const fn = () => {
                server.start();
            };

            expect(fn).to.throw('No certificates were provided to create a secure server with');
        });
    });

    describe('listen', () => {
        it('should listen manually', done => {
            server = new SSLServer({
                autoListen   : false,
                autoStart    : true,
                certificates : Object.assign({}, certificates),
                host         : 'foo.com',
                port         : 3000
            });

            server.listen();

            setTimeout(() => {
                expect(server).to.have.property('listening', true);

                done();
            }, 0);
        });
    });
});
