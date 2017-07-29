const chai   = require('chai');
const expect = chai.expect;

const Get = require('../../../../../operation/api/token/get');

describe('api.token.get', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();

            instance = null;
        }
    });

    describe('initialization', function () {
        it('should be a token get operation', function () {
            instance = new Get();

            expect(instance).to.be.have.property('isTokenGetter', true);
        });
    });

    describe('get', function () {
        it('should get a token', function () {
            instance = new Get();

            instance.exec = this.sandbox.stub().resolves([
                {
                    type  : 'access',
                    token : 'abcd'
                }
            ]);

            const promise = instance.get({
                type : 'access'
            });

            return promise.then((token) => {
                expect(promise).to.be.fullfilled;

                expect(token).to.have.property('type',  'access');
                expect(token).to.have.property('token', 'abcd');
            });
        });

        it('should throw an error', function () {
            instance = new Get();

            instance.exec = this.sandbox.stub().rejects(new Error('foo happens'));

            const promise = instance.get({
                type : 'access'
            });

            return promise.catch((error) => {
                expect(promise).to.be.rejected;

                expect(error).to.be.an('error');
            });
        });
    });
});
