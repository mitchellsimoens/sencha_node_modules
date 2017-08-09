const { expect } = require('chai');
const sinon      = require('sinon');
const mysql      = require('mysql');

const {
    db   : { MySQL },
    util : { Logger }
} = require('../../../');

const _config = {
    db : {
        multipleStatements : true,
        timezone           : 1
    }
};
const _env = {
    DB_HOST        : 'host',
    DB_DATABASE    : 'database',
    DB_USER        : 'user',
    DB_PASSWORD    : 'pass',
    DB_PORT        : 333,
    DB_SOCKET_PATH : 'spath'
};

describe('MySQL', function () {
    let db;

    beforeEach(function () {
        this.sandbox.stub(process, 'env').value(_env);
    });

    afterEach(function () {
        db = null;
    });

    describe('instantiation', function () {
        it('should init with config nested as config.db', function () {
            db = new MySQL(_config);

            expect(db).to.have.property('multipleStatements', true);
            expect(db).to.have.property('timezone',           1);
        });

        it('should init with config', function () {
            db = new MySQL(_config.db);

            expect(db).to.have.property('multipleStatements', true);
            expect(db).to.have.property('timezone',           1);
        });

        it('should init module with process env', function () {
            db = new MySQL(_config);

            expect(db).to.have.property('host',       _env.DB_HOST);
            expect(db).to.have.property('database',   _env.DB_DATABASE);
            expect(db).to.have.property('user',       _env.DB_USER);
            expect(db).to.have.property('password',   _env.DB_PASSWORD);
            expect(db).to.have.property('port',       _env.DB_PORT);
            expect(db).to.have.property('socketPath', _env.DB_SOCKET_PATH);
        });
    });

    describe('getConnectionConfig', function () {
        it('returns configuration options', function () {
            db = new MySQL(_config);

            const opts = db.getConnectionConfig();

            expect(opts).to.have.property('host',               _env.DB_HOST);
            expect(opts).to.have.property('database',           _env.DB_DATABASE);
            expect(opts).to.have.property('user',               _env.DB_USER);
            expect(opts).to.have.property('password',           _env.DB_PASSWORD);
            expect(opts).to.have.property('port',               _env.DB_PORT);
            expect(opts).to.have.property('multipleStatements', _config.db.multipleStatements);
            expect(opts).to.have.property('socketPath',         _env.DB_SOCKET_PATH);
            expect(opts).to.have.property('timezone',           _config.db.timezone);
        });
    });

    describe('debug', function () {
        let mock;

        beforeEach(function () {
            db = new MySQL();

            mock = this.sandbox.mock(Logger);

            mock.expects('log').exactly(5);
        });

        it('should log out debug info', function () {
            db.debug(
                'SELECT 1 FROM ?;',
                [ 'foo' ]
            );

            mock.verify();
        });

        it('should handle an array of sqls', function () {
            db.debug(
                [ 'SELECT 1 FROM ?;' ],
                [ 'foo' ]
            );

            mock.verify();
        });

        it('should handle no inserts', function () {
            db.debug(
                'SELECT 1 FROM ?;'
            );

            mock.verify();
        });
    });

    describe('query', function () {
        beforeEach(function () {
            db = new MySQL();
        });

        it('should query single connection if is not pull-based', function () {
            const { sandbox } = this;
            const _spy1       = sandbox.spy();
            const _spy2       = sandbox.stub();
            const _spy3       = sandbox.spy();
            const connection  = {
                connect : _spy1,
                query   : _spy2.callsArgWith(2, null, {}),
                end     : _spy3
            };

            const mock = sandbox.mock(mysql);

            mock.expects('createConnection').once().returns(connection);

            const promise = db.query('SELECT 1;', []);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    sinon.assert.called(_spy1);
                    sinon.assert.calledWith(_spy2, 'SELECT 1;', []);
                    sinon.assert.called(_spy3);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle mutliple sql statements', function () {
            const { sandbox } = this;
            const _spy1      = sandbox.spy();
            const _spy2      = sandbox.stub();
            const _spy3      = sandbox.spy();
            const connection = {
                connect : _spy1,
                query   : _spy2.callsArgWith(2, null, {}),
                end     : _spy3
            };

            const mock = sandbox.mock(mysql);

            mock.expects('createConnection').once().returns(connection);

            const promise = db.query([ 'SELECT 1;' ], []);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    sinon.assert.called(_spy1);
                    sinon.assert.calledWith(_spy2, 'SELECT 1;', []);
                    sinon.assert.called(_spy3);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle query error', function () {
            const { sandbox } = this;
            const _spy1      = sandbox.spy();
            const _spy2      = sandbox.stub();
            const _spy3      = sandbox.spy();
            const connection = {
                connect : _spy1,
                query   : _spy2.callsArgWith(2, new Error('foo')),
                end     : _spy3
            };

            const mock = sandbox.mock(mysql);

            mock.expects('createConnection').once().returns(connection);

            const promise = db.query('SELECT 1;', []);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');

                    sinon.assert.called(_spy1);
                    sinon.assert.calledWith(_spy2, 'SELECT 1;', []);
                    sinon.assert.called(_spy3);
                });
        });
    });

    describe('ping', function () {
        beforeEach(function () {
            db = new MySQL();
        });

        it('should ping connection', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(mysql);

            mock.expects('createConnection').once().returns({
                connect : sandbox.stub().resolves(),
                end     : sandbox.stub().resolves()
            });

            sandbox.stub(db, 'doPing').resolves({ success : true });

            const promise = db.ping();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle ping error', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(mysql);

            mock.expects('createConnection').once().returns({
                connect : sandbox.stub().resolves(),
                end     : sandbox.stub().resolves()
            });

            sandbox.stub(db, 'doPing').rejects(new Error('foo'));

            const promise = db.ping();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        });
    });

    describe('doPing', function () {
        beforeEach(function () {
            db = new MySQL();
        });

        it('should resolve ping', function () {
            function FakeConnection () {}

            FakeConnection.prototype.ping = function () {};

            const connection = new FakeConnection();
            const stub       = this.sandbox.stub(connection, 'ping').callsArgWith(0, null);
            const promise    = db.doPing(connection);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(stub).to.be.called;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should reject ping', function () {
            function FakeConnection () {}

            FakeConnection.prototype.ping = function () {};

            const connection = new FakeConnection();
            const stub       = this.sandbox.stub(connection, 'ping').callsArgWith(0, new Error('foo'));
            const promise    = db.doPing(connection);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                    expect(stub).to.be.called;
                });
        });
    });
});
