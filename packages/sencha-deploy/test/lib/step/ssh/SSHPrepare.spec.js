const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    step : { ssh : { SSHPrepare } },
    util : { Logger }
} = require('../../../../');

describe('SSHPrepare', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('execute', function () {
        it('should return a promise', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const FakeSSH     = this[ 'sencha-deploy' ].createObservable({
                execCommand : sandbox.stub().resolves({ success : true })
            });

            mock.expects('log').once();

            const SSHPrepare = proxyquire(
                '../../../../lib/step/ssh/SSHPrepare',
                {
                    '../../' : {
                        transfer : {
                            SSH : FakeSSH
                        }
                    }
                }
            );

            instance = new SSHPrepare();

            const promise = instance.execute({
                info : {
                    args : {
                        path : '/foo'
                    }
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should resolve on command execution success', function () {
            const { sandbox } = this;
            const exec_stub   = sandbox.stub().resolves({ success : true });
            const mock        = sandbox.mock(Logger);
            const FakeSSH     = this[ 'sencha-deploy' ].createObservable({
                execCommand : exec_stub
            });

            mock.expects('log').once();

            const SSHPrepare = proxyquire(
                '../../../../lib/step/ssh/SSHPrepare',
                {
                    '../../' : {
                        transfer : {
                            SSH : FakeSSH
                        }
                    }
                }
            );

            instance = new SSHPrepare({
                destinationPath : '/destination',
                stagedPath : '/staged'
            });

            const promise = instance.execute();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(exec_stub).to.be.calledWithExactly('umask 022; mkdir -p -m 755 /staged; mkdir -p -m 755 /destination');

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should reject on command execution failure', function () {
            const { sandbox } = this;
            const exec_stub   = sandbox.stub().rejects(new Error('foo'));
            const mock        = sandbox.mock(Logger);
            const FakeSSH     = this[ 'sencha-deploy' ].createObservable({
                execCommand : exec_stub
            });

            mock.expects('log').once();

            const SSHPrepare = proxyquire(
                '../../../../lib/step/ssh/SSHPrepare',
                {
                    '../../' : {
                        transfer : {
                            SSH : FakeSSH
                        }
                    }
                }
            );

            instance = new SSHPrepare({
                destinationPath : '/destination',
                stagedPath : '/staged'
            });

            const promise = instance.execute();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo')

                    expect(exec_stub).to.be.calledWithExactly('umask 022; mkdir -p -m 755 /staged; mkdir -p -m 755 /destination');

                    mock.verify();
                });
        });
    });

    describe('buildCommands', function () {
        it('should use just staged and destination', function () {
            instance = new SSHPrepare({
                destinationPath : '/destination',
                stagedPath      : '/staged'
            });

            const commands = instance.buildCommands();

            expect(commands).to.equal('umask 022; mkdir -p -m 755 /staged; mkdir -p -m 755 /destination');
        });

        it('should handle extract as true', function () {
            instance = new SSHPrepare({
                destinationPath : '/destination',
                extract         : true,
                stagedPath      : '/staged'
            });

            const commands = instance.buildCommands();

            expect(commands).to.equal('umask 022; mkdir -p -m 755 /staged; mkdir -p -m 755 /destination');
        });

        it('should handle extract as a path', function () {
            instance = new SSHPrepare({
                destinationPath : '/destination',
                extract         : '/extracted',
                stagedPath      : '/staged'
            });

            const commands = instance.buildCommands();

            expect(commands).to.equal('umask 022; mkdir -p -m 755 /staged; mkdir -p -m 755 /destination; mkdir -p -m 755 /extracted');
        });

        it('should handle extractDest as a path', function () {
            instance = new SSHPrepare({
                destinationPath : '/destination',
                extract         : '/staged/extracted',
                extractDest     : '/extracted',
                stagedPath      : '/staged'
            });

            const commands = instance.buildCommands();

            expect(commands).to.equal('umask 022; mkdir -p -m 755 /staged; mkdir -p -m 755 /destination; mkdir -p -m 755 /staged/extracted; mkdir -p -m 755 /extracted');
        });

        it('should ignore extractDest', function () {
            instance = new SSHPrepare({
                destinationPath : '/destination',
                extractDest     : '/extracted',
                stagedPath      : '/staged'
            });

            const commands = instance.buildCommands();

            expect(commands).to.equal('umask 022; mkdir -p -m 755 /staged; mkdir -p -m 755 /destination');
        });
    });
});
