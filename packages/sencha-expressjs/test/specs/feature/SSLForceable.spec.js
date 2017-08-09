const { expect }                                = require('chai');
const { Config }                                = require('@extjs/sencha-core');
const { SSLServer, feature : { SSLForceable } } = require('../../../');

const http  = require('http');
const https = require('https');

describe('feature.SSLForceable', () => {
    let TestServer, certificates, server;

    beforeEach(function () {
        certificates = {
            cert : this[ 'sencha-expressjs' ].getAssetLocation('localhost.crt', Config.appRoot),
            key  : this[ 'sencha-expressjs' ].getAssetLocation('localhost.key', Config.appRoot)
        };

        TestServer = class extends SSLServer {
            static get meta () {
                return {
                    mixins : [
                        SSLForceable
                    ],

                    prototype : {
                        config : {
                            autoListen : false,
                            certificates,
                            port       : 3000
                        }
                    }
                };
            }
        };
    });

    afterEach(() => {
        if (server && !server.destroyed) {
            server.destroy();
        }

        TestServer = certificates = server = null; // eslint-disable-line no-multi-assign
    });

    describe('mixed into', () => {
        it('should be mixed in', () => {
            server = new TestServer();

            expect(server).to.have.property('isSSLForceable', true);
        });
    });

    describe('create app', () => {
        beforeEach(() => {
            server = new TestServer({
                autoStart        : true,
                forceFromPort    : 3001,
                startInsecureApp : true
            });
        });

        it('should create secure app', () => {
            expect(server.app).to.be.a('function');
        });

        it('should create insecure app', () => {
            expect(server.insecureApp).to.be.a('function');
        });
    });

    describe('create server', () => {
        beforeEach(() => {
            server = new TestServer({
                autoStart        : true,
                forceFromPort    : 3001,
                startInsecureApp : true
            });
        });

        it('should create secure server', () => {
            expect(server.server).to.be.instanceof(https.Server);
        });

        it('should create insecure server', () => {
            expect(server.insecureServer).to.be.instanceof(http.Server);
        });
    });

    describe('isSecureRequest', () => {
        beforeEach(() => {
            server = new TestServer();
        });

        it('should detect req.secure', () => {
            const ret = server.isSecureRequest({
                secure : true
            });

            expect(ret).to.be.true;
        });

        it('should not detect req.secure', () => {
            const ret = server.isSecureRequest({
                get () {
                    return 'http';
                }
            });

            expect(ret).to.be.false;
        });

        it('should detect OPTIONS method', () => {
            const ret = server.isSecureRequest({
                method : 'OPTIONS'
            });

            expect(ret).to.be.true;
        });

        it('should not detect OPTIONS method', () => {
            const ret = server.isSecureRequest({
                get () {
                    return 'http';
                }
            });

            expect(ret).to.be.false;
        });

        it('should detect HTTP_X_FORWARDED_PROTO header', () => {
            const ret = server.isSecureRequest({
                get (header) {
                    if (header === 'HTTP_X_FORWARDED_PROTO') {
                        return 'https';
                    }

                    return null;
                }
            });

            expect(ret).to.be.true;
        });

        it('should not detect HTTP_X_FORWARDED_PROTO header', () => {
            const ret = server.isSecureRequest({
                get (header) {
                    if (header === 'HTTP_X_FORWARDED_PROTO') {
                        return 'http';
                    }

                    return null;
                }
            });

            expect(ret).to.be.false;
        });

        it('should detect X-Forwarded-Proto header', () => {
            const ret = server.isSecureRequest({
                get (header) {
                    if (header === 'X-Forwarded-Proto') {
                        return 'https';
                    }

                    return null;
                }
            });

            expect(ret).to.be.true;
        });

        it('should not detect X-Forwarded-Proto header', () => {
            const ret = server.isSecureRequest({
                get (header) {
                    if (header === 'X-Forwarded-Proto') {
                        return 'http';
                    }

                    return null;
                }
            });

            expect(ret).to.be.false;
        });
    });
});
