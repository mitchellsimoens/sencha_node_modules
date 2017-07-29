const chai   = require('chai');
const expect = chai.expect;

const Delete = require('../../../../../operation/api/token/delete');

describe('api.token.delete', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();

            instance = null;
        }
    });

    describe('initialization', function () {
        it('should be a token delete operation', function () {
            instance = new Delete();

            expect(instance).to.be.have.property('isTokenDeleter', true);
        });
    });

    describe('delete', function () {
        it('should delete a token', function () {
            instance = new Delete();

            instance.exec = this.sandbox.stub().resolves([
                {
                    affectedRows : 1
                }
            ]);

            const promise = instance.delete({
                type : 'access'
            });

            return promise.then((result) => {
                expect(promise).to.be.fullfilled;

                expect(result).to.have.property('success', true);
            });
        });

        it('should throw an error', function () {
            instance = new Delete();

            instance.exec = this.sandbox.stub().rejects(new Error('foo happens'));

            const promise = instance.delete({
                type : 'access'
            });

            return promise.catch((error) => {
                expect(promise).to.be.rejected;

                expect(error).to.be.an('error');
            });
        });
    });
});
