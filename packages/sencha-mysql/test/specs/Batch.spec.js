const { expect }       = require('chai');
const { Batch, Query } = require('../../');

describe('Batch', function () {
    let batch;

    beforeEach(function () {
        batch = new Batch();
    });

    afterEach(function () {
        batch.destroy();
        batch = null;
    });

    describe('instantiation', function () {
        it('should be a batch', function () {
            expect(batch).to.have.property('isMySQLBatch', true);
        });

        it('should have empty queue', function () {
            expect(batch.queries).to.have.length(0);
        });

        it('should have one query in queue', function () {
            batch.destroy();

            batch = new Batch({
                queries : [
                    new Query()
                ]
            });

            expect(batch.queries).to.have.length(1);
        });

        it('should have two queries in queue', function () {
            batch.destroy();

            batch = new Batch({
                queries : [
                    new Query(),
                    new Query()
                ]
            });

            expect(batch.queries).to.have.length(2);
        });
    });

    describe('add', function () {
        it('should add query', function () {
            batch.add(new Query());

            expect(batch.queries).to.have.length(1);
        });

        it('should add array of queries', function () {
            batch.add([
                new Query(),
                new Query()
            ]);

            expect(batch.queries).to.have.length(2);
        });
    });

    describe('count', function () {
        it('should have no queries', function () {
            expect(batch.count).to.have.equal(0);
        });

        it('should have one query', function () {
            batch.add(new Query());

            expect(batch.count).to.have.equal(1);
        });

        it('should have two queries', function () {
            batch.add([
                new Query(),
                new Query()
            ]);

            expect(batch.count).to.have.equal(2);
        });
    });

    describe('insertsSerialized', function () {
        it('should have no insert params', function () {
            expect(batch.insertsSerialized).to.have.length(0);
        });

        it('should have one insert params from one query', function () {
            batch.add(new Query({
                inserts : [ 'foo' ]
            }));

            expect(batch.insertsSerialized).to.have.length(1);
        });

        it('should have one insert params from two queries (one with no inserts)', function () {
            batch.add([
                new Query(),
                new Query({
                    inserts : [ 'foo' ]
                })
            ]);

            expect(batch.insertsSerialized).to.have.length(1);
        });

        it('should have one insert params from two queries (one empty inserts)', function () {
            batch.add([
                new Query({
                    inserts : []
                }),
                new Query({
                    inserts : [ 'foo' ]
                })
            ]);

            expect(batch.insertsSerialized).to.have.length(1);
        });

        it('should have two insert params from two queries', function () {
            batch.add([
                new Query({
                    inserts : [ 'foo' ]
                }),
                new Query({
                    inserts : [ 'foo' ]
                })
            ]);

            expect(batch.insertsSerialized).to.have.length(2);
            //check for proper concatenation
            expect(batch.insertsSerialized[0]).to.be.a('string');
        });

        it('should have two insert params from one query', function () {
            batch.add(new Query({
                inserts : [ 'foo', 'bar' ]
            }));

            expect(batch.insertsSerialized).to.have.length(2);
        });

        it('should have two insert params from two queries (one with no inserts)', function () {
            batch.add([
                new Query(),
                new Query({
                    inserts : [ 'foo', 'bar' ]
                })
            ]);

            expect(batch.insertsSerialized).to.have.length(2);
        });

        it('should have two insert params from two queries (one empty inserts)', function () {
            batch.add([
                new Query({
                    inserts : []
                }),
                new Query({
                    inserts : [ 'foo', 'bar' ]
                })
            ]);

            expect(batch.insertsSerialized).to.have.length(2);
        });
    });

    describe('sqlsSerialized', function () {
        it('should have no sql queries', function () {
            expect(batch.sqlsSerialized).to.have.length(0);
        });

        it('should have one sql query from one query', function () {
            batch.add(new Query({
                sqls : [ 'SELECT 1;' ]
            }));

            expect(batch.sqlsSerialized).to.have.equal('SELECT 1;');
        });

        it('should have one sql query from two queries (one with no sql)', function () {
            batch.add([
                new Query(),
                new Query({
                    sqls : [ 'SELECT 1;' ]
                })
            ]);

            expect(batch.sqlsSerialized).to.have.equal('SELECT 1;');
        });

        it('should have one sql query from two queries (one empty sql)', function () {
            batch.add([
                new Query({
                    sqls : []
                }),
                new Query({
                    sqls : [ 'SELECT 1;' ]
                })
            ]);

            expect(batch.sqlsSerialized).to.have.equal('SELECT 1;');
        });

        it('should have two sql queries from two queries', function () {
            batch.add([
                new Query({
                    sqls : [ 'SELECT 1;' ]
                }),
                new Query({
                    sqls : [ 'SELECT 2;' ]
                })
            ]);

            expect(batch.sqlsSerialized).to.have.equal('SELECT 1;SELECT 2;');
        });

        it('should have two sql queries from one query', function () {
            batch.add(new Query({
                sqls : [ 'SELECT 1;', 'SELECT 2;' ]
            }));

            expect(batch.sqlsSerialized).to.have.equal('SELECT 1;SELECT 2;');
        });

        it('should have two sql queries from two queries (one with no inserts)', function () {
            batch.add([
                new Query(),
                new Query({
                    sqls : [ 'SELECT 1;', 'SELECT 2;' ]
                })
            ]);

            expect(batch.sqlsSerialized).to.have.equal('SELECT 1;SELECT 2;');
        });

        it('should have two sql queries from two queries (one empty inserts)', function () {
            batch.add([
                new Query({
                    sqls : []
                }),
                new Query({
                    sqls : [ 'SELECT 1;', 'SELECT 2;' ]
                })
            ]);

            expect(batch.sqlsSerialized).to.have.equal('SELECT 1;SELECT 2;');
        });
    });

    describe('resolve', function () {
        it('should resolve one sql query on one Query', function () {
            const query = new Query({
                sqls : [ 'SELECT 1;' ]
            });
            const batch = new Batch();

            batch.add(query);

            query.resolve = this.sandbox.spy(results => {
                expect(results).to.have.length(1);
                expect(results[0]).to.have.equal('foo');

                query.deferred.resolve(results);
            });

            batch.resolve([
                'foo'
            ]);

            return query;
        });

        it('should resolve two sql query on one Query', function () {
            const query = new Query({
                sqls : [
                    'SELECT 1;',
                    'SELECT 2;'
                ]
            });
            const batch = new Batch();

            batch.add(query);

            query.resolve = this.sandbox.spy(results => {
                expect(results).to.have.length(2);
                expect(results[0]).to.have.equal('foo');
                expect(results[1]).to.have.equal('bar');

                query.deferred.resolve(results);
            });

            batch.resolve([
                'foo',
                'bar'
            ]);

            return query;
        });

        it('should resolve two sql query on two Query', function () {
            const query1 = new Query({
                sqls : [
                    'SELECT 1;'
                ]
            });
            const query2 = new Query({
                sqls : [
                    'SELECT 2;'
                ]
            });
            const batch  = new Batch();

            batch.add([ query1, query2 ]);

            query1.resolve = this.sandbox.spy(results => {
                expect(results).to.have.equal('foo');

                query1.deferred.resolve(results);
            });

            query2.resolve = this.sandbox.spy(results => {
                expect(results).to.have.equal('bar');

                query2.deferred.resolve(results);
            });

            batch.resolve([
                'foo',
                'bar'
            ]);

            return query2;
        });

        it('should resolve three sql query on two Query', function () {
            const query1 = new Query({
                sqls : [
                    'SELECT 1;',
                    'SELECT 2;'
                ]
            });
            const query2 = new Query({
                sqls : [
                    'SELECT 3;'
                ]
            });
            const batch  = new Batch();

            batch.add([ query1, query2 ]);

            query1.resolve = this.sandbox.spy(results => {
                expect(results).is.an('array');
                expect(results).to.have.members([ 'foo', 'bar' ]);
                expect(results).to.not.have.members([ 'baz' ])

                query1.deferred.resolve(results);
            });

            query2.resolve = this.sandbox.spy(results => {
                expect(results).to.have.equal('baz');

                query2.deferred.resolve(results);
            });

            batch.resolve([
                'foo',
                'bar',
                'baz'
            ]);

            return query2;
        });
    });

    describe('reject', function () {
        it('should reject one Query using Error instance', function () {
            const query = new Query();
            const batch = new Batch();

            batch.add(query);

            query.reject = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error.message).to.be.equal('query failed');

                query.deferred.reject(error);
            });

            batch.reject(new Error('query failed'));

            batch.catch(batch.emptyFn);

            return query
                .catch(query.emptyFn);
        });

        it('should reject two Query using Error instance', function () {
            const query1 = new Query();
            const query2 = new Query();
            const batch  = new Batch();

            batch.add([ query1, query2 ]);

            query1.resolve = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error.message).to.be.equal('query failed');

                query1.deferred.reject(error);
            });

            query2.reject = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error.message).to.be.equal('query failed');

                query2.deferred.reject(error);
            });

            batch.reject(new Error('query failed'));

            batch.catch(batch.emptyFn);

            return Promise
                .all([ query1, query2 ])
                .catch(query2.emptyFn);
        });

        it('should reject one Query using Error string', function () {
            const query = new Query();
            const batch = new Batch();

            batch.add(query);

            query.reject = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error.message).to.be.equal('something bad');

                query.deferred.reject(error);
            });

            batch.reject('something bad');

            batch.catch(batch.emptyFn);

            return query
                .catch(query.emptyFn);
        });

        it('should reject two Query using Error string', function () {
            const query1 = new Query();
            const query2 = new Query();
            const batch  = new Batch();

            batch.add([ query1, query2 ]);

            query1.resolve = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error.message).to.be.equal('something bad');

                query1.deferred.reject(error);
            });

            query2.reject = this.sandbox.spy(error => {
                expect(error).to.be.instanceof(Error);
                expect(error.message).to.be.equal('something bad');

                query2.deferred.reject(error);
            });

            batch.reject('something bad');

            batch.catch(batch.emptyFn);

            return Promise
                .all([ query1, query2 ])
                .catch(query2.emptyFn);
        });
    });
});
