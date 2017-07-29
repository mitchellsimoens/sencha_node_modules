const { expect }                                = require('chai');
const { Config }                                = require('@extjs/sencha-core');
const { SSLServer, feature : { SSLForceable } } = require('../../../');

const http  = require('http');
const https = require('https');

describe('feature.SSLForceable', function() {
    let TestServer, certificates, server;

    beforeEach(function () {
        certificates = {
            cert : this.getAssetLocation('localhost.crt', Config.appRoot),
            key  : this.getAssetLocation('localhost.key', Config.appRoot)
        }

        TestServer = class extends SSLServer {
            static get meta () {
                return {
                    mixins : [
                        SSLForceable
                    ],

                    prototype : {
                        config : {
                            certificates : certificates,
                            port         : 3000
                        }
                    }
                };
            }
        };
    });

    afterEach(function() {
        if (server && !server.destroyed) {
            server.destroy();
        }

        TestServer = certificates = server = null;
    });

    describe('mixed into', function() {
        it('should be mixed in', function() {
            server = new TestServer();

            expect(server).to.have.property('isSSLForceable', true);
        });
    });

    describe('create app', function() {
        beforeEach(function() {
            server = new TestServer({
                autoListen       : false,
                autoStart        : true,
                startInsecureApp : true,
                forceFromPort    : 3001
            });
        });

        it('should create secure app', function() {
            expect(server.app).to.be.a('function');
        });

        it('should create insecure app', function() {
            expect(server.insecureApp).to.be.a('function');
        });
    });

    describe('create server', function() {
        beforeEach(function() {
            server = new TestServer({
                autoStart        : true,
                startInsecureApp : true,
                forceFromPort    : 3001
            });
        });

        it('should create secure server', function() {
            expect(server.server).to.be.instanceof(https.Server);
        });

        it('should create insecure server', function() {
            expect(server.insecureServer).to.be.instanceof(http.Server);
        });
    });

    describe('isSecureRequest', function() {
        beforeEach(function() {
            server = new TestServer();
        });

        it('should detect req.secure', function() {
            let ret = server.isSecureRequest({
                secure : true
            });

            expect(ret).to.be.true;
        });

        it('should not detect req.secure', function() {
            let ret = server.isSecureRequest({
                get () {
                    return 'http';
                }
            });

            expect(ret).to.be.false;
        });

        it('should detect OPTIONS method', function() {
            let ret = server.isSecureRequest({
                method : 'OPTIONS'
            });

            expect(ret).to.be.true;
        });

        it('should not detect OPTIONS method', function() {
            let ret = server.isSecureRequest({
                get () {
                    return 'http';
                }
            });

            expect(ret).to.be.false;
        });

        it('should detect HTTP_X_FORWARDED_PROTO header', function() {
            let ret = server.isSecureRequest({
                get (header) {
                    if (header === 'HTTP_X_FORWARDED_PROTO') {
                        return 'https';
                    }
                }
            });

            expect(ret).to.be.true;
        });

        it('should not detect HTTP_X_FORWARDED_PROTO header', function() {
            let ret = server.isSecureRequest({
                get (header) {
                    if (header === 'HTTP_X_FORWARDED_PROTO') {
                        return 'http';
                    }
                }
            });

            expect(ret).to.be.false;
        });

        it('should detect X-Forwarded-Proto header', function() {
            let ret = server.isSecureRequest({
                get (header) {
                    if (header === 'X-Forwarded-Proto') {
                        return 'https';
                    }
                }
            });

            expect(ret).to.be.true;
        });

        it('should not detect X-Forwarded-Proto header', function() {
            let ret = server.isSecureRequest({
                get (header) {
                    if (header === 'X-Forwarded-Proto') {
                        return 'http';
                    }
                }
            });

            expect(ret).to.be.false;
        });
    });
});
