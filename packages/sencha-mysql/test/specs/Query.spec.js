const { expect } = require('chai');
const { Query }  = require('../../');

describe('Query', function () {
    let query;

    afterEach(function () {
        if (query && !query.destroyed) {
            query.destroy();
        }

        query = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            query = new Query();
        });

        it('should be a query', function () {
            expect(query).to.have.property('isMySQLQuery', true);
        });

        it('should have a deferred', function () {
            expect(query.deferred.promise).to.be.a('promise');
            expect(query.deferred.reject).to.be.a('function');
            expect(query.deferred.resolve).to.be.a('function');
        });

        it('should have a promise', function () {
            expect(query.promise).to.be.a('promise');
        });
    });

    describe('count', function () {
        it('should have no queries', function () {
            query = new Query();

            expect(query).to.have.property('count', 0);
        });

        it('should have one query', function () {
            query = new Query({
                sqls : [
                    'SELECT 1;'
                ]
            });

            expect(query).to.have.property('count', 1);
        });

        it('should have two queries', function () {
            query = new Query({
                sqls : [
                    'SELECT 1;',
                    'SELECT 2;'
                ]
            });

            expect(query).to.have.property('count', 2);
        });
    });

    describe('sqlsSerialized', function () {
        it('should have no queries', function () {
            query = new Query();

            expect(query).to.have.property('sqlsSerialized', '');
        });

        it('should have one query', function () {
            query = new Query({
                sqls : [
                    'SELECT 1;'
                ]
            });

            expect(query).to.have.property('sqlsSerialized', 'SELECT 1;');
        });

        it('should have two queries', function () {
            query = new Query({
                sqls : [
                    'SELECT 1;',
                    'SELECT 2;'
                ]
            });

            expect(query).to.have.property('sqlsSerialized', 'SELECT 1;SELECT 2;');
        });
    });

    describe('insertsSerialized', function () {
        it('should have zero insert param', function () {
            query = new Query();

            expect(query.insertsSerialized).to.have.length(0);
        });

        it('should have zero insert param', function () {
            query = new Query({
                inserts : []
            });

            expect(query.insertsSerialized).to.have.length(0);
        });

        it('should have one insert param', function () {
            query = new Query({
                inserts : [
                    'foo'
                ]
            });

            expect(query.insertsSerialized).to.have.length(1);
            expect(query.insertsSerialized).to.have.contains('foo');
        });

        it('should have two insert params', function () {
            query = new Query({
                inserts : [
                    'foo',
                    'bar'
                ]
            });

            expect(query.insertsSerialized).to.have.length(2);
            expect(query.insertsSerialized).to.have.contains('foo');
            expect(query.insertsSerialized).to.have.contains('bar');
        });
    });

    describe('sqls', function () {
        it('should have zero sqls from undefined', function () {
            query = new Query();

            expect(query.sqls).to.be.a('array');
            expect(query.sqls).to.have.length(0);
        });

        it('should have zero sqls from empty array', function () {
            query = new Query({
                sqls : []
            });

            expect(query.sqls).to.be.a('array');
            expect(query.sqls).to.have.length(0);
        });

        it('should have one sql from array', function () {
            query = new Query({
                sqls : [
                    'SELECT 1;'
                ]
            });

            expect(query.sqls).to.be.a('array');
            expect(query.sqls).to.have.length(1);
            expect(query.sqls).to.have.contains('SELECT 1;');
        });

        it('should have one sql from string', function () {
            query = new Query({
                sqls : 'SELECT 1;'
            });

            expect(query.sqls).to.be.a('array');
            expect(query.sqls).to.have.length(1);
            expect(query.sqls).to.have.contains('SELECT 1;');
        });

        it('should have two sql', function () {
            query = new Query({
                sqls : [
                    'SELECT 1;',
                    'SELECT 2;'
                ]
            });

            expect(query.sqls).to.be.a('array');
            expect(query.sqls).to.have.length(2);
            expect(query.sqls).to.have.contains('SELECT 1;');
            expect(query.sqls).to.have.contains('SELECT 2;');
        });

        it('should handle undefined', function () {
            query = new Query();

            query.sqls = undefined;

            expect(query.sqls).to.be.a('array');
            expect(query.sqls).to.have.length(0);
        });
    });

    describe('resolve', function () {
        beforeEach(function () {
            query = new Query();
        });

        it('should resolve', function () {
            const spy     = this.sandbox.spy(function (results) {
                    expect(results).to.have.equal('foo');
                });
            const promise = query.promise.then(spy);

            query.resolve('foo');

            return promise;
        });

        it('should not reject', function () {
            const reject  = this.sandbox.spy();
            const resolve = this.sandbox.spy(function () {
                expect(resolve).to.have.been.called;
            });
            const promise = query.promise.then(resolve, reject);

            query.resolve('foo');

            return promise;
        });
    });

    describe('reject', function () {
        beforeEach(function () {
            query = new Query();
        });

        it('should reject from Error instance', function () {
            const spy     = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error).to.have.property('message', 'something bad');
            });
            const promise = query.promise.then(query.emptyFn, spy);

            query.reject(new Error('something bad'));

            return promise;
        });

        it('should reject from Error string', function () {
            const spy     = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error).to.have.property('message', 'something bad');
            });
            const promise = query.promise.then(query.emptyFn, spy);

            query.reject('something bad');

            return promise;
        });

        it('should not resolve', function () {
            const resolve = this.sandbox.spy();
            const reject  = this.sandbox.spy(() => {
                expect(resolve).to.not.have.been.called;
            });
            const promise = query.promise.then(resolve, reject);

            query.reject('something bad');

            return promise;
        });
    });

    describe('logger', function () {
        beforeEach(function () {
            query = new Query();
        });

        describe('get', function () {
            it('should return console as default', function () {
                expect(query).to.have.property('logger', console);
            });

            it('should return set logger', function () {
                query.logger = 'foo';

                expect(query).to.have.property('logger', 'foo');
            });
        });

        describe('set', function () {
            it('should set logger', function () {
                query.logger = 'foo';

                expect(query).to.have.property('logger', 'foo');
            });
        });
    });

    describe('debug', function () {
        describe('single sql statement', function () {
            it('should debug with no inserts', function () {
                const log = this.sandbox.spy();

                query = new Query({
                    logger : { log },
                    sqls   : 'SELECT 1;'
                });

                query.debug();

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\n');
            });

            it('should debug with inserts', function () {
                const log = this.sandbox.spy();

                query = new Query({
                    inserts : [ 1 ],
                    logger  : { log },
                    sqls    : 'SELECT ?;'
                });

                query.debug();

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\n');
            });
        });

        describe('multiple sql statements', function () {
            it('should debug with no inserts', function () {
                const log = this.sandbox.spy();

                query = new Query({
                    logger : { log },
                    sqls   : [ 'SELECT 1;', 'SELECT 2;' ]
                });

                query.debug();

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\nSELECT 2;\n');
            });

            it('should debug with inserts', function () {
                const log = this.sandbox.spy();

                query = new Query({
                    inserts : [ 1, 2 ],
                    logger  : { log },
                    sqls    : [ 'SELECT ?;', 'SELECT ?;' ]
                });

                query.debug();

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\nSELECT 2;\n');
            });
        });
    });
});
