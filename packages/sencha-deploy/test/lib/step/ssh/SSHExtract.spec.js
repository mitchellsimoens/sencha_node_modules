const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    step : { ssh : { SSHExtract } },
    util : { Logger }
} = require('../../../../');

describe('SSHExtract', function () {
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

            const SSHExtract = proxyquire(
                '../../../../lib/step/ssh/SSHExtract',
                {
                    '../../' : {
                        transfer : {
                            SSH : FakeSSH
                        }
                    }
                }
            );

            instance = new SSHExtract({
                destinationPath : '/destination',
                file            : '/src/test.zip',
                stagedPath      : '/staged'
            });

            const promise = instance.execute();

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

            const SSHExtract = proxyquire(
                '../../../../lib/step/ssh/SSHExtract',
                {
                    '../../' : {
                        transfer : {
                            SSH : FakeSSH
                        }
                    }
                }
            );

            instance = new SSHExtract({
                destinationPath : '/destination',
                file            : '/src/test.zip',
                stagedPath      : '/staged'
            });

            const promise = instance.execute();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(exec_stub).to.be.calledWithExactly('mv /staged/test.zip /destination/test.zip; chmod -R 755 /destination; rm -rf /staged');

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

            const SSHExtract = proxyquire(
                '../../../../lib/step/ssh/SSHExtract',
                {
                    '../../' : {
                        transfer : {
                            SSH : FakeSSH
                        }
                    }
                }
            );

            instance = new SSHExtract({
                destinationPath : '/destination',
                file            : '/src/test.zip',
                stagedPath      : '/staged'
            });

            const promise = instance.execute();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');

                    expect(exec_stub).to.be.calledWithExactly('mv /staged/test.zip /destination/test.zip; chmod -R 755 /destination; rm -rf /staged');

                    mock.verify();
                });
        });
    });

    describe('buildCommands', function () {
        describe('skip extract', function () {
            it('should only set chmod', function () {
                instance = new SSHExtract({
                    destinationPath : '/destination',
                    file            : '/src/test.zip',
                    stagedPath      : '/destination'
                });

                const commands = instance.buildCommands();

                expect(commands).to.equal('chmod -R 755 /destination');
            });

            it('should move and set chmod and remove stage', function () {
                instance = new SSHExtract({
                    destinationPath : '/destination',
                    file            : '/src/test.zip',
                    stagedPath      : '/staged'
                });

                const commands = instance.buildCommands();

                expect(commands).to.equal('mv /staged/test.zip /destination/test.zip; chmod -R 755 /destination; rm -rf /staged');
            });
        });

        describe('extract', function () {
            it('should handle extract as true', function () {
                instance = new SSHExtract({
                    destinationPath : '/destination',
                    extract         : true,
                    file            : '/src/test.zip',
                    stagedPath      : '/staged'
                });

                const commands = instance.buildCommands();

                expect(commands).to.equal('unzip /staged/test.zip -d /staged; rm -rf /staged/test.zip; mv /staged/* /destination; chmod -R 755 /destination; rm -rf /staged');
            });

            it('should handle extract as a path', function () {
                instance = new SSHExtract({
                    destinationPath : '/destination',
                    extract         : '/extracted',
                    file            : '/src/test.zip',
                    stagedPath      : '/staged'
                });

                const commands = instance.buildCommands();

                expect(commands).to.equal('unzip /staged/test.zip -d /staged; rm -rf /staged/test.zip; mv /extracted/* /destination; chmod -R 755 /destination; rm -rf /staged');
            });

            it('should handle extractDest as a path', function () {
                instance = new SSHExtract({
                    destinationPath : '/destination',
                    extract         : '/staged/extracted',
                    extractDest     : '/extracted',
                    file            : '/src/test.zip',
                    stagedPath      : '/staged'
                });

                const commands = instance.buildCommands();

                expect(commands).to.equal('unzip /staged/test.zip -d /staged; mv /staged/extracted/* /extracted; chmod -R 755 /extracted; mv /staged/test.zip /destination; rm -rf /staged');
            });

            it('should ignore extractDest ', function () {
                instance = new SSHExtract({
                    destinationPath : '/destination',
                    extractDest     : '/extracted',
                    file            : '/src/test.zip',
                    stagedPath      : '/staged'
                });

                const commands = instance.buildCommands();

                expect(commands).to.equal('mv /staged/test.zip /destination/test.zip; chmod -R 755 /destination; rm -rf /staged');
            });
        });
    });
});
