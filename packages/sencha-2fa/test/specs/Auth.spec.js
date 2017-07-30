const { expect } = require('chai');
const { Auth }   = require('../../');
const proxyquire = require('proxyquire');

describe('Auth', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Auth();
        });

        it('should be an auth', function () {
            expect(instance).to.have.property('isAuth', true);
        });
    });

    describe('generateSecret', function () {
        describe('base32', function () {
            beforeEach(function () {
                instance = new Auth();
            });

            it('should generate a secret object', function () {
                const secret = instance.generateSecret();

                expect(secret).to.equal(instance.secret);

                expect(secret).to.have.property('ascii');
                expect(secret.ascii).to.have.lengthOf(20);

                expect(secret).to.have.property('hex');
                expect(secret.hex).to.have.lengthOf(40);

                expect(secret).to.have.property('base32');
                expect(secret.base32).to.have.lengthOf(32);

                expect(secret).to.have.property('otpauth_url');
                expect(secret.otpauth_url).to.have.lengthOf(64);
            });

            it('should generate a secret object with 40 length', function () {
                const secret = instance.generateSecret({
                    length: 40
                });

                expect(secret).to.equal(instance.secret);

                expect(secret).to.have.property('ascii');
                expect(secret.ascii).to.have.lengthOf(40);

                expect(secret).to.have.property('hex');
                expect(secret.hex).to.have.lengthOf(80);

                expect(secret).to.have.property('base32');
                expect(secret.base32).to.have.lengthOf(64);

                expect(secret).to.have.property('otpauth_url');
                expect(secret.otpauth_url).to.have.lengthOf(96);
            });
        });
    });

    describe('getAuthenticatorUrl', function () {
        describe('base32', function () {
            beforeEach(function () {
                instance = new Auth({
                    label : 'me@me.com'
                });

                instance.generateSecret();
            });

            it('should generate a url with issuer and label', function () {
                const url = instance.getAuthenticatorUrl();

                expect(url).to.equal(`otpauth://totp/me@me.com?secret=${instance.secret.base32}&issuer=Sencha`);
            });

            it('should override defaults', function () {
                const url = instance.getAuthenticatorUrl({
                    issuer : 'MyBiz',
                    label  : 'you@you.com',
                    secret : 'ABCDEFG'
                });

                expect(url).to.equal(`otpauth://totp/you@you.com?secret=ABCDEFG&issuer=MyBiz`);
            });
        });
    });

    describe('getQRCode', function () {
        let url;

        describe('base32', function () {
            beforeEach(function () {
                instance = new Auth();

                instance.generateSecret();

                url = instance.getAuthenticatorUrl({
                    label : 'me@me.com'
                });
            });

            it('should generate a qr code', function () {
                return instance
                    .getQRCode(url)
                    .then(uri => {
                        expect(uri).to.be.a('string');
                        expect(uri).to.have.lengthOf.at.least(2000);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });

            it('should handle a qr code error', function () {
                instance.destroy();

                const toDataURL = this.sandbox.stub().callsArgWith(1, new Error('qr code failed'));
                const Cls       = proxyquire(
                    '../../Auth',
                    {
                        qrcode : {
                            toDataURL
                        }
                    }
                );

                instance = new Cls();

                instance.generateSecret();

                url = instance.getAuthenticatorUrl({
                    label : 'me@me.com'
                });

                return instance
                    .getQRCode(url)
                    .then(() => {
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('qr code failed');
                    });
            });
        });
    });

    describe('getAuthToken', function () {
        describe('base32', function () {
            beforeEach(function () {
                instance = new Auth();

                instance.generateSecret();
            });

            it('should generate an auth token', function () {
                const token = instance.getAuthToken();

                expect(token).to.be.a('string');
                expect(token).to.have.lengthOf(6);
            });

            it('should generate an auth token changing defaults', function () {
                const token = instance.getAuthToken({
                    secret : 'ABCDEFG'
                });

                expect(token).to.be.a('string');
                expect(token).to.have.lengthOf(6);
            });
        });
    });

    describe('validateToken', function () {
        describe('base32', function () {
            it('should validate the token', function () {
                const verify = this.sandbox.stub().returns(true);
                const Cls    = proxyquire(
                    '../../Auth',
                    {
                        speakeasy : {
                            totp : {
                                verify
                            }
                        }
                    }
                );

                instance = new Cls();

                instance.generateSecret();

                const valid = instance.validateToken({
                    token : '123456'
                });

                expect(valid).to.be.true;

                verify.should.have.been.calledWith({
                    encoding : 'base32',
                    secret   : instance.secret.base32,
                    token    : '123456'
                });
            });

            it('should validate the token by overriding defaults', function () {
                const verify = this.sandbox.stub().returns(true);
                const Cls    = proxyquire(
                    '../../Auth',
                    {
                        speakeasy : {
                            totp : {
                                verify
                            }
                        }
                    }
                );

                instance = new Cls();

                const valid = instance.validateToken({
                    secret : 'ABCDEFG',
                    token  : '123456'
                });

                expect(valid).to.be.true;

                verify.should.have.been.calledWith({
                    encoding : 'base32',
                    secret   : 'ABCDEFG',
                    token    : '123456'
                });
            });
        });
    });
});
