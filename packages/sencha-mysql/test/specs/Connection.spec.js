const { expect }            = require('chai');
const { Connection, Query } = require('../../');
const proxyquire            = require('proxyquire');

describe('Connection', function () {
    let Cls, connection, query;

    afterEach(function () {
        if (connection && !connection.destroyed) {
            connection.destroy();
        }

        if (query && !query.destroyed) {
            query.destroy();
        }

        Cls = connection = query = null;
    });

    describe('instantiation', function () {
        it('should be a connection', function () {
            connection = new Connection({
                autoConnect : false
            });

            expect(connection).to.have.property('isMySQLConnection', true);
        });

        it('should connect', function () {
            const spy = this.sandbox.spy();

            class MyConnection extends Connection {
                connect () {
                    spy();
                }
            }

            connection = new MyConnection();

            expect(spy).to.have.been.called;
        });

        it('should not connect', function () {
            connection = new Connection({
                autoConnect : false
            });

            expect(connection.$connection).to.be.undefined;
        });

        it('should not connect if not using pool', function () {
            const spy = this.sandbox.spy();

            class MyConnection extends Connection {
                connect () {
                    spy();
                }
            }

            connection = new MyConnection({
                usePool : false
            });

            expect(spy).to.not.have.been.called;
        });
    });

    describe('debug', function () {
        beforeEach(function () {
            connection = new Connection({
                autoConnect : false
            });
        });

        describe('single sql statement', function () {
            it('should debug with no inserts', function () {
                const result = Connection.debug(
                    'SELECT 1;'
                );

                expect(result).to.equal('SELECT 1;\n');
            });

            it('should debug with inserts', function () {
                const result = Connection.debug(
                    'SELECT ?;',
                    [ 1 ]
                );

                expect(result).to.equal('SELECT 1;\n');
            });
        });

        describe('multiple sql statements', function () {
            it('should debug with no inserts', function () {
                const result = Connection.debug(
                    [ 'SELECT 1;', 'SELECT 2;' ]
                );

                expect(result).to.equal('SELECT 1;\nSELECT 2;\n');
            });

            it('should debug with inserts', function () {
                const result = Connection.debug(
                    [ 'SELECT ?;', 'SELECT ?;' ],
                    [ 1, 2 ]
                );

                expect(result).to.equal('SELECT 1;\nSELECT 2;\n');
            });
        });
    });

    describe('suspended', function () {
        beforeEach(function () {
            connection = new Connection({
                autoConnect : false
            });
        });

        it('should not be suspended', function () {
            expect(connection).to.have.property('suspended', false);
        });

        it('should be suspended', function () {
            connection.suspended = true;

            expect(connection).to.have.property('suspended', true);
        });
    });

    describe('query', function () {
        beforeEach(function () {
            connection = new Connection({
                autoConnect : false
            });
        });

        it('should execute query', function () {
            return connection
                .query(
                    'portal',
                    [ 'SELECT 1;' ]
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('This connection is not yet connected: undefined');
                });
        });

        it('should queue one query', function () {
            connection.suspended = true;

            connection.query(
                'portal',
                [ 'SELECT 1;' ]
            );

            expect(connection.queryBatch).to.have.property('count', 1);
        });

        it('should queue two queries', function () {
            connection.suspended = true;

            connection.query(
                'portal',
                [ 'SELECT 1;' ]
            );
            connection.query(
                'portal',
                [ 'SELECT 2;' ]
            );

            expect(connection.queryBatch).to.have.property('count', 2);
        });

        it('should execute batch', function () {
            connection.suspended = true;

            const promise = connection
                .query(
                    'portal',
                    [ 'SELECT 1;' ]
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('This connection is not yet connected: undefined');
                });

            connection.suspended = false;

            return promise
                .catch(connection.emptyFn);
        });
    });

    describe('transact', function () {
        beforeEach(function () {
            connection = new Connection({
                autoConnect : false
            });
        });

        it('should execute transact', function () {
            return connection
                .transact(
                    'portal',
                    [ 'SELECT 1;' ]
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('This connection is not yet connected: undefined');
                });
        });

        it('should transact one query', function () {
            connection.suspended = true;

            connection.transact(
                'portal',
                [ 'SELECT 1;' ]
            );

            expect(connection.transactionBatch).to.have.property('count', 1);
        });

        it('should transact two queries', function () {
            connection.suspended = true;

            connection.transact(
                'portal',
                [ 'SELECT 1;' ]
            );
            connection.transact(
                'portal',
                [ 'SELECT 2;' ]
            );

            expect(connection.transactionBatch).to.have.property('count', 2);
        });

        it('should execute batch', function () {
            connection.suspended = true;

            const promise = connection
                .transact(
                    'portal',
                    [ 'SELECT 1;' ]
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('This connection is not yet connected: undefined');
                });

            connection.suspended = false;

            return promise
                .catch(connection.emptyFn);
        });
    });

    describe('connect', function () {
        describe('pool', function () {
            let Cls, spy;

            beforeEach(function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createPool : spy = this.sandbox.stub().returns('fake pool')
                        }
                    }
                );

                connection = new Cls({
                    autoConnect : false,
                    database    : 'mydatabase',
                    host        : 'foo.com',
                    password    : 'mypassword',
                    user        : 'myuser'
                });
            });

            afterEach(function () {
                Cls = null
            });

            it('should create pool', function () {
                connection.connect();

                spy.should.have.been.calledWith({
                    connectionLimit    : 10,
                    database           : 'mydatabase',
                    host               : 'foo.com',
                    multipleStatements : true,
                    password           : 'mypassword',
                    port               : 3306,
                    user               : 'myuser'
                });

                expect(connection).to.have.property('$pool', 'fake pool');
            });
        });

        describe('connection', function () {
            let Cls, spy;

            beforeEach(function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createConnection : spy = this.sandbox.stub().returns('fake connection')
                        }
                    }
                );

                connection = new Cls({
                    usePool  : false,
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser'
                });
            });

            afterEach(function () {
                Cls = null
            });

            it('should create connection', function () {
                connection.connect();

                spy.should.have.been.calledWith({
                    database           : 'mydatabase',
                    host               : 'foo.com',
                    multipleStatements : true,
                    password           : 'mypassword',
                    port               : 3306,
                    user               : 'myuser'
                });

                expect(connection).to.have.property('$connection', 'fake connection');
            });
        });
    });

    describe('exec', function () {
        let Cls, query;

        afterEach(function () {
            if (query && !query.destroyed) {
                query.destroy();
            }

            Cls = query = null;
        });

        describe('no connection', function () {
            it('should fail if no connection', function () {
                query      = new Query();
                connection = new Connection({
                    autoConnect : false,
                    name        : 'foo'
                });

                connection.exec(query);

                return query
                    .then(() => {
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('This connection is not yet connected: foo');
                    });
            });
        });

        describe('pool', function () {
            it('should execute query', function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createPool : this.sandbox.stub().returns('fake pool')
                        }
                    }
                );

                query      = new Query();
                connection = new Cls({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser'
                });

                const stub = this.sandbox.stub(connection, '_doExec').resolves('good');

                connection.exec(query);

                return query
                    .then(ret => {
                        expect(ret).to.equal('good');

                        stub.should.have.been.calledWith(query);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });
        });

        describe('connection', function () {
            it('should execute query', function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createConnection : this.sandbox.stub().returns('fake connection')
                        }
                    }
                );

                query      = new Query();
                connection = new Cls({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser',
                    usePool  : false
                });

                const stub = this.sandbox.stub(connection, '_doExec').resolves('good');

                connection.exec(query);

                return query
                    .then(ret => {
                        expect(ret).to.equal('good');

                        stub.should.have.been.calledWith(query);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });

            it('should execute query after connecting', function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createConnection : this.sandbox.stub().returns('fake connection')
                        }
                    }
                );

                query      = new Query();
                connection = new Cls({
                    autoConnect : false,
                    database    : 'mydatabase',
                    host        : 'foo.com',
                    password    : 'mypassword',
                    user        : 'myuser',
                    usePool     : false
                });

                const stub = this.sandbox.stub(connection, '_doExec').resolves('good');

                connection.exec(query);

                return query
                    .then(ret => {
                        expect(ret).to.equal('good');

                        stub.should.have.been.calledWith(query);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });
        });
    });

    describe('_doExec', function () {
        beforeEach(function () {
            query = new Query({
                inserts : [ 1 ],
                sqls    : 'SELECT ?;'
            });
        });

        describe('pool', function () {
            it('should execute query', function () {
                const queryStub = this.sandbox.stub().callsArgWith(2, null, 'results');

                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createPool : this.sandbox.stub().returns({
                                query : queryStub
                            })
                        }
                    }
                );

                connection = new Cls({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser'
                });

                return connection
                    ._doExec(query)
                    .then(ret => {
                        expect(ret).to.equal('results');

                        queryStub.should.have.been.calledWith('SELECT ?;', [ 1 ]);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });

            it('should handle a query error', function () {
                const queryStub = this.sandbox.stub().callsArgWith(2, new Error('query failed'));

                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createPool : this.sandbox.stub().returns({
                                query : queryStub
                            })
                        }
                    }
                );

                connection = new Cls({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser'
                });

                return connection
                    ._doExec(query)
                    .then(() => {
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('query failed');

                        queryStub.should.have.been.calledWith('SELECT ?;', [ 1 ]);
                    });
            });
        });

        describe('connection', function () {
            beforeEach(function () {
                connection = new Connection({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser',
                    usePool  : false
                });
            });

            it('should execute query', function () {
                const end       = this.sandbox.stub().callsArgWith(0);
                const queryStub = this.sandbox.stub().callsArgWith(2, null, 'results');

                const instance = {
                    end,
                    query : queryStub
                };

                return connection
                    ._doExec(query, instance)
                    .then(ret => {
                        expect(ret).to.equal('results');

                        queryStub.should.have.been.calledWith('SELECT ?;', [ 1 ]);
                    })
                    .catch((e) => {
                        expect(false).to.be.true;
                    });
            });

            it('should handle a query error', function () {
                const end       = this.sandbox.stub().callsArgWith(0);
                const queryStub = this.sandbox.stub().callsArgWith(2, new Error('query failed'));

                const instance = {
                    end,
                    query : queryStub
                };

                return connection
                    ._doExec(query, instance)
                    .then(() => {
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('query failed');

                        queryStub.should.have.been.calledWith('SELECT ?;', [ 1 ]);
                    });
            });

            describe('queryTimeout', function () {
                it('should clear timeout on successful query', function () {
                    connection.queryTimeout = 100;

                    const end       = this.sandbox.stub().callsArgWith(0);
                    const queryStub = this.sandbox.stub().callsArgWith(2, null, 'results');

                    const instance = {
                        end,
                        query : queryStub
                    };

                    return connection
                        ._doExec(query, instance)
                        .then(ret => {
                            expect(ret).to.equal('results');

                            queryStub.should.have.been.calledWith('SELECT ?;', [ 1 ]);
                        })
                        .catch(() => {
                            expect(false).to.be.true;
                        });
                });

                it('should time out', function () {
                    connection.queryTimeout = 5;

                    const destroy   = this.sandbox.stub();
                    const end       = this.sandbox.stub();
                    const queryStub = this.sandbox.stub().callsFake((sql, inserts, callback) => {
                        setTimeout(() => {
                            callback();
                        }, 10);
                    });

                    const instance = {
                        destroy, end,
                        query : queryStub
                    };

                    return connection
                        ._doExec(query, instance)
                        .then(() => {
                            expect(false).to.be.true;
                        })
                        .catch(error => {
                            expect(destroy).to.have.been.called;
                            expect(end).to.not.have.been.called;

                            expect(error.message).to.equal('Query timed out');
                        });
                });
            });
        });
    });

    describe('doTransact', function () {
        describe('no connection', function () {
            it('should fail if no connection', function () {
                query      = new Query();
                connection = new Connection({
                    autoConnect : false,
                    name        : 'foo'
                });

                connection.doTransact(query);

                return query
                    .then(() => {
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('This connection is not yet connected: foo');
                    });
            });
        });

        describe('pool', function () {
            it('should execute query', function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createPool : this.sandbox.stub().returns({
                                getConnection : this.sandbox.stub().callsArgWith(0, null, 'fake connection')
                            })
                        }
                    }
                );

                query      = new Query();
                connection = new Cls({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser'
                });

                const stub = this.sandbox
                    .stub(connection, 'doConnectionTransact')
                    .callsFake((query, connection) => {
                        query.resolve('good');

                        expect(connection).to.equal('fake connection');
                    });

                connection.doTransact(query);

                return query
                    .then(ret => {
                        expect(ret).to.equal('good');

                        stub.should.have.been.calledWith(query);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });

            it('should handle get connection error', function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createPool : this.sandbox.stub().returns({
                                getConnection : this.sandbox.stub().callsArgWith(0, new Error('no connection found'))
                            })
                        }
                    }
                );

                query      = new Query();
                connection = new Cls({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser'
                });

                connection.doTransact(query);

                return query
                    .then(() => {
                        expect(false).to.be.true;
                    })
                    .catch(error => {
                        expect(error.message).to.equal('no connection found');
                    });
            });
        });

        describe('connection', function () {
            it('should execute query', function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createConnection : this.sandbox.stub()
                        }
                    }
                );

                query      = new Query();
                connection = new Cls({
                    database : 'mydatabase',
                    host     : 'foo.com',
                    password : 'mypassword',
                    user     : 'myuser',
                    usePool  : false
                });

                const stub = this.sandbox
                    .stub(connection, 'doConnectionTransact')
                    .callsFake((query, connection) => {
                        query.resolve('good');

                        expect(connection).to.be.undefined;
                    });

                connection.doTransact(query);

                return query
                    .then(ret => {
                        expect(ret).to.equal('good');

                        stub.should.have.been.calledWith(query);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });

            it('should exeucte query after connecting', function () {
                Cls = proxyquire(
                    '../../Connection',
                    {
                        mysql : {
                            createConnection : this.sandbox.stub().returns('fake connection')
                        }
                    }
                );

                query      = new Query();
                connection = new Cls({
                    autoConnect : false,
                    database    : 'mydatabase',
                    host        : 'foo.com',
                    password    : 'mypassword',
                    user        : 'myuser',
                    usePool     : false
                });

                const stub = this.sandbox
                    .stub(connection, 'doConnectionTransact')
                    .callsFake((query, connection) => {
                        query.resolve('good');

                        expect(connection).to.be.undefined;
                    });

                connection.doTransact(query);

                return query
                    .then(ret => {
                        expect(ret).to.equal('good');

                        stub.should.have.been.calledWith(query);
                    })
                    .catch(() => {
                        expect(false).to.be.true;
                    });
            });
        });
    });

    describe('doConnectionTransact', function () {
        beforeEach(function () {
            connection = new Connection({
                autoConnect : false
            });
        });

        it('should handle begin error', function () {
            const beginTransaction = this.sandbox.stub().callsArgWith(0, new Error('something happened'));

            query = new Query();

            connection.$connection = {
                beginTransaction
            };

            connection.doConnectionTransact(query);

            return query
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('something happened');

                    expect(beginTransaction).to.have.been.called;
                });
        });

        it('should execute query', function () {
            const beginTransaction = this.sandbox.stub().callsArgWith(0, null);
            const commit           = this.sandbox.stub().callsArgWith(0, null);

            const instance = {
                beginTransaction,
                commit
            };

            query = new Query();

            const execStub = this.sandbox.stub(connection, '_doExec').resolves([ {} ]);

            connection.doConnectionTransact(query, instance);

            return query
                .then(results => {
                    expect(results).to.be.an('array');
                    expect(results).to.have.lengthOf(1);

                    expect(beginTransaction).to.have.been.called;
                    expect(commit).to.have.been.called;
                    expect(execStub).to.have.been.called;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle query error', function () {
            const beginTransaction = this.sandbox.stub().callsArgWith(0, null);
            const commit           = this.sandbox.stub().callsArgWith(0, null);
            const rollback         = this.sandbox.stub().callsArgWith(0);

            const instance = {
                beginTransaction,
                commit,
                rollback
            };

            query = new Query();

            const execStub = this.sandbox.stub(connection, '_doExec').rejects(new Error('query failure'));

            connection.doConnectionTransact(query, instance);

            return query
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('query failure');

                    expect(beginTransaction).to.have.been.called;
                    expect(commit).to.not.have.been.called;
                    expect(execStub).to.have.been.called;
                    expect(rollback).to.have.been.called;
                });
        });

        it('should handle commit error', function () {
            const beginTransaction = this.sandbox.stub().callsArgWith(0, null);
            const commit           = this.sandbox.stub().callsArgWith(0, new Error('commit failure'));
            const rollback         = this.sandbox.stub().callsArgWith(0);

            const instance = {
                beginTransaction,
                commit,
                rollback
            };

            query = new Query();

            const execStub = this.sandbox.stub(connection, '_doExec').resolves([ {} ]);

            connection.doConnectionTransact(query, instance);

            return query
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('commit failure');

                    expect(beginTransaction).to.have.been.called;
                    expect(commit).to.have.been.called;
                    expect(execStub).to.have.been.called;
                    expect(rollback).to.have.been.called;
                });
        });
    });
});
