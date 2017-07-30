const { expect } = require('chai');

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

            return this
                .expectResolved(promise)
                .then((result) => {
                    expect(result).to.have.property('success', true);
                });
        });

        it('should throw an error', function () {
            instance = new Delete();

            instance.exec = this.sandbox.stub().rejects(new Error('foo happens'));

            const promise = instance.delete({
                type : 'access'
            });

            return this
                .expectRejected(promise)
                .catch(error => {
                    expect(error).to.be.an('error');
                });
        });
    });
});
