const { expect } = require('chai');

const {
    db   : { Connection },
    util : { Logger }
} = require('../../../');

const fakeConnectionAdapter = function (config) {
    Object.assign(this, config.db);

    return this;
};

describe('Connection', function () {
    describe('instantiation', function () {
        it('should create connection instance', function () {
            const connection = new Connection();

            expect(connection.config).to.be.undefined;
        });

        it('should create connection instance with config', function () {
            const connection = new Connection({
                db : {
                    host : 'foo'
                }
            });

            //expect(connection).to.have.deep.property('config.db.host', 'foo');
            expect(connection.config.db.host).to.equal('foo');
        });

        it('should create connection passing config in constructor', function () {
            const connection = new Connection({
                db : {
                    host : 'foo'
                }
            });

            connection.create(fakeConnectionAdapter);

            //expect(connection).to.have.deep.property('connection.host', 'foo');
            expect(connection.connection.host).to.equal('foo');
        });

        it('should create connection passing config in create method', function () {
            const connection = new Connection();

            connection.create(
                fakeConnectionAdapter,
                {
                    db : {
                        host : 'foo'
                    }
                }
            );

            //expect(connection).to.have.deep.property('connection.host', 'foo');
            expect(connection.connection.host).to.equal('foo');
        });
    });

    describe('ping', function () {
        it('should ping connection', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const connection = new Connection({
                db : {
                    host : 'foo'
                }
            });

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeConnectionAdapter, {
                ping : sandbox.stub().resolves()
            });

            connection.create(Cls);

            const res = connection.ping();

            return res
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should not ping connection', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const connection = new Connection({
                db : {
                    host : 'foo'
                }
            });

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeConnectionAdapter, {
                ping : sandbox.stub().rejects('foo')
            });

            connection.create(Cls);

            const res = connection.ping();

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Unable to connect to the database.');
                });
        });
    });

    describe('query', function () {
        it('should query the connection', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const connection = new Connection({
                db : {
                    host : 'foo'
                }
            });

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeConnectionAdapter, {});

            connection.create(Cls);

            const stub = connection.connection.query = sandbox.stub().resolves([ {} ]);

            const promise = connection.query('SELECT 1 FROM ?;', [ 'foo' ]);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(stub).to.be.calledOnce;
                    expect(stub).to.be.calledWithExactly('SELECT 1 FROM ?;', [ 'foo' ]);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle a query error', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const connection = new Connection({
                db : {
                    host : 'foo'
                }
            });

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeConnectionAdapter, {});

            connection.create(Cls);

            const stub = connection.connection.query = sandbox.stub().rejects(new Error('foo'));

            const promise = connection.query('SELECT 1 FROM ?;', [ 'foo' ]);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(stub).to.be.calledOnce;
                    expect(stub).to.be.calledWithExactly('SELECT 1 FROM ?;', [ 'foo' ]);

                    expect(error.message).to.equal('foo');
                });
        });
    });

    describe('debug', function () {
        it('should show query debug info', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const connection = new Connection({
                db : {
                    host : 'foo'
                }
            });

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeConnectionAdapter, {});

            connection.create(Cls);

            const stub = connection.connection.debug = sandbox.stub();

            connection.debug('SELECT 1 FROM ?;', [ 'foo' ]);

            expect(stub).to.be.calledOnce;
            expect(stub).to.be.calledWithExactly('SELECT 1 FROM ?;', [ 'foo' ]);
        });
    });
});
