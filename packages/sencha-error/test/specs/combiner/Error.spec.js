const { Error }  = require('../../../combiner/');
const { expect } = require('chai');

describe('Error', function () {
    let combiner;

    afterEach(function () {
        if (combiner) {
            combiner.destroy();
            combiner = null;
        }
    });

    describe('instantiation', function () {
        beforeEach(function () {
            combiner = new Error();
        });

        it('should be an error combiner', function () {
            expect(combiner).to.have.property('isErrorCombiner', true);
        });

        it('should be a combiner', function () {
            expect(combiner).to.have.property('isCombiner', true);
        });

        it('should mix deferrable in', function () {
            expect(combiner).to.have.property('isDeferrable', true);
        });
    });

    describe('check', function () {
        beforeEach(function () {
            combiner = new Error();
        });

        it('should not do anything if pending operations', function (done) {
            combiner.count = 2;

            combiner.check();

            setTimeout(() => {
                expect(combiner.data).to.not.be.null;
                expect(combiner.data).to.be.an('object');
                expect(combiner.data).to.be.empty;

                done();
            }, 10);
        });

        it('should resolve if no pending operations', function () {
            const data         = { foo : 'bar' };
            const { deferred } = combiner;

            combiner.data = data;

            combiner.check();

            return deferred
                .then(ret => {
                    expect(ret).to.equal(data);
                    expect(ret).to.have.property('foo', 'bar');
                });
        });

        it('should reject if no pending operations and has an error', function () {
            const error        = new Error();
            const { deferred } = combiner;

            combiner.hasError = error;

            combiner.check();

            return deferred
                .catch(ret => {
                    expect(ret).to.equal(error);
                });
        });
    });
});
