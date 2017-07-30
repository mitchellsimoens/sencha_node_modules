const { expect } = require('chai');
const proxyquire = require('proxyquire');

describe('Token', function () {
    let Token, instance;

    function mockToken (Manager = {}) {
        Token = proxyquire('../../../api/Token', {
            '../Manager' : Manager
        });

        instance = new Token();
    }

    afterEach(function () {
        if (instance) {
            instance.destroy();
        }

        Token = instance = null;
    });

    it('should be a token', function () {
        mockToken();

        expect(instance).to.be.have.property('isApiToken', true);
    });

    describe('getToken', function () {
        it('should return a token', function * () {
            const sandbox = this.sandbox;

            mockToken({
                instantiateOperation : sandbox.stub().returns({
                    get : sandbox.stub().resolves({
                        type  : 'access',
                        token : 'abcd'
                    })
                })
            });

            const token = yield Token.getToken();

            expect(token).to.have.property('type',  'access');
            expect(token).to.have.property('token', 'abcd');
        });

        it('should return a code token', function * () {
            const sandbox = this.sandbox;

            mockToken({
                instantiateOperation : sandbox.stub().returns({
                    get : sandbox.stub().resolves({
                        type  : 'code',
                        token : 'abcd'
                    })
                })
            });

            const token = yield Token.getToken({
                type : 'code'
            });

            expect(token).to.have.property('type',  'code');
            expect(token).to.have.property('token', 'abcd');
        });
    });

    describe('createToken', function () {
        it('should create a token', function () {
            const sandbox = this.sandbox;

            mockToken({
                instantiateOperation : sandbox.stub().returns({
                    create : sandbox.stub().resolves({
                        type  : 'access',
                        token : 'abcd'
                    })
                })
            });

            const promise = Token.createToken({
                type  : 'access',
                token : 'abcd'
            });

            return this.expectResolved(promise);
        });

        it('should return a token', function * () {
            const sandbox = this.sandbox;

            mockToken({
                instantiateOperation : sandbox.stub().returns({
                    create : sandbox.stub().resolves({
                        type  : 'access',
                        token : 'abcd'
                    })
                })
            });

            const token = yield Token.createToken({
                type  : 'access',
                token : 'abcd'
            });

            expect(token).to.have.property('type',  'access');
            expect(token).to.have.property('token', 'abcd');
        });
    });

    describe('deleteToken', function () {
        it('should delete a token', function () {
            const sandbox = this.sandbox;

            mockToken({
                instantiateOperation : sandbox.stub().returns({
                    delete : sandbox.stub().resolves({
                        success : true
                    })
                })
            });

            const promise = Token.deleteToken({
                type  : 'access',
                token : 'abcd'
            });

            return this.expectResolved(promise);
        });
    });
});
