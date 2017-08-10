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
    DB_DATABASE    : 'database',
    DB_HOST        : 'host',
    DB_PASSWORD    : 'pass',
    DB_PORT        : 333,
    DB_SOCKET_PATH : 'spath',
    DB_USER        : 'user'
};

describe('MySQL', () => {
    let db, envStub;

    beforeEach(() => {
        Logger.init();

        envStub = sinon.stub(process, 'env').value(_env);
    });

    afterEach(() => {
        envStub.restore();

        db      = null;
        envStub = null;
    });

    describe('instantiation', () => {
        it('should init with config nested as config.db', () => {
            db = new MySQL(_config);

            expect(db).to.have.property('multipleStatements', true);
            expect(db).to.have.property('timezone',           1);
        });

        it('should init with config', () => {
            db = new MySQL(_config.db);

            expect(db).to.have.property('multipleStatements', true);
            expect(db).to.have.property('timezone',           1);
        });

        it('should init module with process env', () => {
            db = new MySQL(_config);

            expect(db).to.have.property('host',       _env.DB_HOST);
            expect(db).to.have.property('database',   _env.DB_DATABASE);
            expect(db).to.have.property('user',       _env.DB_USER);
            expect(db).to.have.property('password',   _env.DB_PASSWORD);
            expect(db).to.have.property('port',       _env.DB_PORT);
            expect(db).to.have.property('socketPath', _env.DB_SOCKET_PATH);
        });
    });

    describe('getConnectionConfig', () => {
        it('returns configuration options', () => {
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

    describe('debug', () => {
        let mock;

        beforeEach(() => {
            db = new MySQL();

            mock = sinon.mock(Logger);

            mock.expects('log').exactly(5);
        });

        it('should log out debug info', () => {
            db.debug(
                'SELECT 1 FROM ?;',
                [ 'foo' ]
            );

            mock.verify();
        });

        it('should handle an array of sqls', () => {
            db.debug(
                [ 'SELECT 1 FROM ?;' ],
                [ 'foo' ]
            );

            mock.verify();
        });

        it('should handle no inserts', () => {
            db.debug(
                'SELECT 1 FROM ?;'
            );

            mock.verify();
        });
    });

    describe('query', () => {
        beforeEach(() => {
            db = new MySQL();
        });

        it('should query single connection if is not pull-based', () => {
            const _spy1       = sinon.spy();
            const _spy2       = sinon.stub();
            const _spy3       = sinon.spy();
            const connection  = {
                connect : _spy1,
                end     : _spy3,
                query   : _spy2.callsArgWith(2, null, {})
            };

            const mock = sinon.mock(mysql);

            mock
                .expects('createConnection')
                .once()
                .returns(connection);

            const promise = db.query('SELECT 1;', []);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    sinon.assert.called(_spy1);
                    sinon.assert.calledWith(_spy2, 'SELECT 1;', []);
                    sinon.assert.called(_spy3);

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle mutliple sql statements', () => {
            const _spy1      = sinon.spy();
            const _spy2      = sinon.stub();
            const _spy3      = sinon.spy();
            const connection = {
                connect : _spy1,
                end     : _spy3,
                query   : _spy2.callsArgWith(2, null, {})
            };

            const mock = sinon.mock(mysql);

            mock
                .expects('createConnection')
                .once()
                .returns(connection);

            const promise = db.query([ 'SELECT 1;' ], []);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    sinon.assert.called(_spy1);
                    sinon.assert.calledWith(_spy2, 'SELECT 1;', []);
                    sinon.assert.called(_spy3);

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle query error', () => {
            const _spy1      = sinon.spy();
            const _spy2      = sinon.stub();
            const _spy3      = sinon.spy();
            const connection = {
                connect : _spy1,
                end     : _spy3,
                query   : _spy2.callsArgWith(2, new Error('foo'))
            };

            const mock = sinon.mock(mysql);

            mock
                .expects('createConnection')
                .once()
                .returns(connection);

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

                    mock.verify();
                });
        });
    });

    describe('ping', () => {
        beforeEach(() => {
            db = new MySQL();
        });

        it('should ping connection', () => {
            const mock = sinon.mock(mysql);
            const stub = sinon.stub(db, 'doPing').resolves({ success : true });

            mock
                .expects('createConnection')
                .once()
                .returns({
                    connect : sinon.stub().resolves(),
                    end     : sinon.stub().resolves()
                });

            const promise = db.ping();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(true).to.be.true;

                    mock.verify();
                    stub.restore();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle ping error', () => {
            const mock = sinon.mock(mysql);
            const stub = sinon.stub(db, 'doPing').rejects(new Error('foo'));

            mock
                .expects('createConnection')
                .once()
                .returns({
                    connect : sinon.stub().resolves(),
                    end     : sinon.stub().resolves()
                });

            const promise = db.ping();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');

                    mock.verify();
                    stub.restore();
                });
        });
    });

    describe('doPing', () => {
        beforeEach(() => {
            db = new MySQL();
        });

        it('should resolve ping', () => {
            function FakeConnection () {} // eslint-disable-line no-empty-function

            FakeConnection.prototype.ping = () => {}; // eslint-disable-line no-empty-function

            const connection = new FakeConnection();
            const stub       = sinon.stub(connection, 'ping').callsArgWith(0, null);
            const promise    = db.doPing(connection);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(stub).to.be.called;

                    stub.restore();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should reject ping', () => {
            function FakeConnection () {} // eslint-disable-line no-empty-function

            FakeConnection.prototype.ping = () => {}; // eslint-disable-line no-empty-function

            const connection = new FakeConnection();
            const stub       = sinon.stub(connection, 'ping').callsArgWith(0, new Error('foo'));
            const promise    = db.doPing(connection);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                    expect(stub).to.be.called;

                    stub.restore();
                });
        });
    });
});
