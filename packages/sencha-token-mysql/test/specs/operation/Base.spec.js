const chai   = require('chai');
const expect = chai.expect;

const Base = require('../../../operation/Base');

describe('Base', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();

            instance = null;
        }
    });

    describe('initialization', function () {
        it('should be a token base operation', function () {
            instance = new Base();

            expect(instance).to.be.have.property('isTokenBaseOperation', true);
        });
    });

    describe('exec', function () {
        it('should execute query', function () {
            instance = new Base();

            instance.db = {
                exec : function(query) {
                    query.resolve([
                        {},
                        {}
                    ]);
                }
            };

            const promise = instance.exec({
                sqls : 'SELECT 1;'
            });

            return promise.then(() => {
                expect(promise).to.be.fulfilled;
            });
        });

        it('should add token purge query', function () {
            instance = new Base();

            instance.db = {
                exec : function(query) {
                    expect(query.sqls).to.have.lengthOf(2);

                    query.resolve([
                        {},
                        {}
                    ]);
                }
            };

            const promise = instance.exec({
                sqls : 'SELECT 1;'
            });

            return promise.then(() => {
                expect(promise).to.be.fulfilled;
            });
        });

        it('should not add token purge query', function () {
            instance = new Base();

            instance.db = {
                exec : function(query) {
                    expect(query.sqls).to.have.lengthOf(1);

                    query.resolve([
                        {}
                    ]);
                }
            };

            const promise = instance.exec({
                sqls : 'SELECT 1;'
            }, false);

            return promise.then(() => {
                expect(promise).to.be.fulfilled;
            });
        });
    });

    describe('generate', function () {
        it('should generate a random sha1 hash', function () {
            instance = new Base();

            const token = instance.generate();

            expect(token).to.have.lengthOf(40);
        });

        it('should generate a sha1 hash', function () {
            instance = new Base();

            const token = instance.generate('foo');

            expect(token).to.have.lengthOf(40);
            expect(token).to.be.equal('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33');
        });

        it('should generate a salted sha1 hash', function () {
            instance = new Base();

            const token = instance.generate('foo', 'bar');

            expect(token).to.have.lengthOf(40);
            expect(token).to.be.equal('8843d7f92416211de9ebb963ff4ce28125932878');
        });
    });
});
