const { expect }              = require('chai');
const { Connection, Manager } = require('../../');

describe('Manager', function () {
    afterEach(function () {
        Manager.remove();

        Manager.logger = undefined;
    });

    describe('instantiation', function () {
        it('should be a singleton', function () {
            expect(Manager.isInstance).to.be.true;
        });

        it('should be a manager', function () {
            expect(Manager.isMySQLManager).to.be.true;
        });
    });

    describe('add', function () {
        it('should add instance', function () {
            const connection = new Connection({
                autoConnect : false
            });

            Manager.add('portal', connection);

            expect(Manager.__$instances.has('portal')).to.be.true;
            expect(Manager.__$instances.get('portal')).to.be.instanceof(Connection);
            expect(Manager.__$instances.get('portal')).to.be.equal(connection);
        });

        it('should add config', function () {
            Manager.add('portal', {
                autoConnect : false
            });

            expect(Manager.__$instances.has('portal')).to.be.true;
            expect(Manager.__$instances.get('portal')).to.be.instanceof(Connection);
        });

        it('should add object of instance', function () {
            const connection = new Connection({
                autoConnect : false
            });

            Manager.add({
                portal : connection
            });

            expect(Manager.__$instances.has('portal')).to.be.true;
            expect(Manager.__$instances.get('portal')).to.be.instanceof(Connection);
            expect(Manager.__$instances.get('portal')).to.be.equal(connection);
        });

        it('should add object of config', function () {
            Manager.add({
                portal : {
                    autoConnect : false
                }
            });

            expect(Manager.__$instances.has('portal')).to.be.true;
            expect(Manager.__$instances.get('portal')).to.be.instanceof(Connection);
        });

        it('should throw error on adding existing name', function () {
            const fn = () => {
                Manager.add('portal', {
                    autoConnect : false
                });
            };

            fn();

            expect(fn).to.throw(Error);
        });

        it('should skip adding', function () {
            const connection = new Connection({
                autoConnect : false
            });
            const fn         = () => {
                Manager.add('portal', connection);
            };

            fn();

            expect(fn).to.not.throw(Error);
        });

        it('should have no connections', function () {
            //meant to check for cleanup
            expect(Manager.__$instances.has('portal')).to.be.false;
        });
    });

    describe('get', function () {
        beforeEach(function () {
            Manager.add('portal', {
                autoConnect : false
            });
        });

        afterEach(function () {
            Manager.remove();
        });

        it('should get connection', function () {
            expect(Manager.get('portal')).to.be.instanceof(Connection);
        });
    });

    describe('close', function () {
        let connection;

        beforeEach(function () {
            Manager.add('portal', connection = new Connection({
                autoConnect : false
            }));
        });

        afterEach(function () {
            connection = null;
        });

        it('should close passed connection', function () {
            Manager.remove(connection);

            expect(Manager.__$instances.has('portal')).to.be.false
        });

        it('should close passed name', function () {
            Manager.remove('portal');

            expect(Manager.__$instances.has('portal')).to.be.false
        });

        it('should close all', function () {
            Manager.remove();

            expect(Manager.__$instances.has('portal')).to.be.false
        });
    });

    describe('suspend', function () {
        let connection;

        beforeEach(function () {
            Manager.add('portal', connection = new Connection({
                autoConnect : false
            }));
        });

        afterEach(function () {
            connection = null;
        });

        it('should suspend connection', function () {
            Manager.suspend(connection);

            expect(connection.suspended).to.be.true;
        });

        it('should suspend all connections', function () {
            Manager.suspend();

            expect(connection.suspended).to.be.true;
        });
    });

    describe('resume', function () {
        let connection;

        beforeEach(function () {
            Manager.add('portal', connection = new Connection({
                autoConnect : false
            }));

            Manager.suspend(connection);
        });

        afterEach(function () {
            connection = null;
        });

        it('should resume connection', function () {
            Manager.resume(connection);

            expect(connection.suspended).to.be.false;
        });

        it('should resume all connections', function () {
            Manager.resume();

            expect(connection.suspended).to.be.false;
        });
    });

    describe('isSuspended', function () {
        let connection;

        beforeEach(function () {
            Manager.add('portal', connection = new Connection({
                autoConnect : false
            }));
        });

        afterEach(function () {
            connection = null;
        });

        it('should not be suspended', function () {
            expect(Manager.isSuspended(connection)).to.be.false;
        });

        it('should be suspended', function () {
            Manager.suspend(connection);

            expect(Manager.isSuspended(connection)).to.be.true;
        });
    });

    describe('query', function () {
        let connection;

        beforeEach(function () {
            Manager.add('portal', connection = new Connection({
                autoConnect : false
            }));
        });

        afterEach(function () {
            connection = null;
        });

        it('should query the instance', function () {
            return Manager
                .query(
                    connection,
                    [ 'SELECT 1;' ]
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('This connection is not yet connected: undefined');
                });
        });

        it('should query the name', function () {
            return Manager
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

        it('should not recognize name', function () {
            const spy = this.sandbox.spy(error => {
                expect(spy).to.have.been.called;
                expect(error).to.be.instanceof(Error);
            });

            return Manager
                .query(
                    'foo',
                    'SELECT 1;'
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(spy);
        });
    });

    describe('transact', function () {
        let connection;

        beforeEach(function () {
            Manager.add('portal', connection = new Connection({
                autoConnect : false
            }));
        });

        afterEach(function () {
            connection = null;
        });

        it('should transact the instance', function () {
            return Manager
                .transact(
                    connection,
                    [ 'SELECT 1;' ]
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('This connection is not yet connected: undefined');
                });
        });

        it('should transact the name', function () {
            return Manager
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

        it('should not recognize name', function () {
            const spy = this.sandbox.spy(error => {
                expect(spy).to.have.been.called;
                expect(error).to.be.instanceof(Error);
            });

            return Manager
                .transact(
                    'foo',
                    'SELECT 1;'
                )
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(spy);
        });
    });

    describe('logger', function () {
        describe('get', function () {
            it('should return console as default', function () {
                expect(Manager).to.have.property('logger', console);
            });

            it('should return set logger', function () {
                Manager.logger = 'foo';

                expect(Manager).to.have.property('logger', 'foo');
            });
        });

        describe('set', function () {
            it('should set logger', function () {
                Manager.logger = 'foo';

                expect(Manager).to.have.property('logger', 'foo');
            });
        });
    });

    describe('debug', function () {
        describe('single sql statement', function () {
            it('should debug with no inserts', function () {
                const log = this.sandbox.spy();

                Manager.logger = {
                    log
                };

                Manager.debug(
                    'SELECT 1;'
                );

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\n');
            });

            it('should debug with inserts', function () {
                const log = this.sandbox.spy();

                Manager.logger = {
                    log
                };

                Manager.debug(
                    'SELECT ?;',
                    [ 1 ]
                );

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\n');
            });
        });

        describe('multiple sql statements', function () {
            it('should debug with no inserts', function () {
                const log = this.sandbox.spy();

                Manager.logger = {
                    log
                };

                Manager.debug(
                    [ 'SELECT 1;', 'SELECT 2;' ]
                );

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\nSELECT 2;\n');
            });

            it('should debug with inserts', function () {
                const log = this.sandbox.spy();

                Manager.logger = {
                    log
                };

                Manager.debug(
                    [ 'SELECT ?;', 'SELECT ?;' ],
                    [ 1, 2 ]
                );

                expect(log.callCount).to.equal(5);
                log.thirdCall.should.have.been.calledWith('SELECT 1;\nSELECT 2;\n');
            });
        });
    });
});
