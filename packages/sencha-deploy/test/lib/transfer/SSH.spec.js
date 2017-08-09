const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

const { util : { Logger } } = require('../../../');

describe('SSH', () => {
    let Client,
        ClientCmdFail, ClientFail,
        ClientProgress, ClientProgressBuffer,
        ClientStreamFail, ClientStreamFailBuffer,
        SSH, STDERR, Stream,
        instance;

    beforeEach(function () {
        Logger.init();

        STDERR = this[ 'sencha-deploy' ].createObservable();

        Stream = this[ 'sencha-deploy' ].createObservable({
            end () {
                this.events = null;
            },
            get stderr () {
                let instance = this._stderr;

                if (!instance) {
                    instance = new STDERR();

                    this._stderr = instance;
                }

                return instance;
            }
        });

        Client = this[ 'sencha-deploy' ].createObservable({
            connect () {
                this.emit('ready');

                return this;
            },
            end () {
                this.events = null;
            },
            exec (cmd, callback) {
                const stream = new Stream();

                callback(null, stream);

                stream.emit('close');

                stream.end();
            }
        });

        ClientProgress = this[ 'sencha-deploy' ].createObservable(Client, {
            exec (cmd, callback) {
                const stream = new Stream();

                callback(null, stream);

                setTimeout(() => {
                    stream.emit('data', 'foo');

                    stream.emit('close');
                }, 5);
            }
        });

        ClientProgressBuffer = this[ 'sencha-deploy' ].createObservable(Client, {
            exec (cmd, callback) {
                const stream = new Stream();

                callback(null, stream);

                setTimeout(() => {
                    stream.emit('data', Buffer.from('foo'));

                    stream.emit('close');

                    stream.end();
                }, 5);
            }
        });

        ClientFail = this[ 'sencha-deploy' ].createObservable(Client, {
            connect () {
                this.emit('error', new Error('connection failure'));

                return this;
            },
            exec (cmd, callback) {
                callback(new Error('command execution fail'));
            }
        });

        ClientCmdFail = this[ 'sencha-deploy' ].createObservable(Client, {
            exec (cmd, callback) {
                callback(new Error('Cmd execution failed'));
            }
        });

        ClientStreamFail = this[ 'sencha-deploy' ].createObservable(Client, {
            exec (cmd, callback) {
                const stream = new Stream();

                callback(null, stream);

                setTimeout(() => {
                    stream.stderr.emit('data', 'foo');

                    stream.emit('close');

                    stream.end();
                }, 5);
            }
        });

        ClientStreamFailBuffer = this[ 'sencha-deploy' ].createObservable(Client, {
            exec (cmd, callback) {
                const stream = new Stream();

                callback(null, stream);

                setTimeout(() => {
                    stream.stderr.emit('data', Buffer.from('foo'));

                    stream.emit('close');

                    stream.end();
                }, 5);
            }
        });

        SSH = proxyquire('../../../lib/transfer/SSH', {
            ssh2 : {
                Client
            }
        });
    });

    afterEach(() => {
        instance = // eslint-disable-line operator-linebreak
        STDERR = Stream = SSH = // eslint-disable-line no-multi-assign,operator-linebreak
        Client = // eslint-disable-line no-multi-assign,operator-linebreak
        ClientProgress = ClientProgressBuffer = // eslint-disable-line no-multi-assign,operator-linebreak
        ClientFail = ClientCmdFail = // eslint-disable-line no-multi-assign,operator-linebreak
        ClientStreamFail = ClientStreamFailBuffer =// eslint-disable-line no-multi-assign,operator-linebreak
            null;
    });

    describe('createConnection', () => {
        it('should return a promise', () => {
            instance = new SSH();

            const promise = instance.createConnection();

            expect(promise).to.be.a('promise');
        });

        it('should resolve when ready', () => {
            instance = new SSH();

            const promise = instance.createConnection();

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should reject on connect failure', () => {
            const SSH = proxyquire('../../../lib/transfer/SSH', {
                ssh2 : {
                    Client : ClientFail
                }
            });

            instance = new SSH();

            const promise = instance.createConnection();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('connection failure');
                });
        });
    });

    describe('execCommand', () => {
        it('should return a promise', () => {
            instance = new SSH();

            const promise = instance.execCommand('foo');

            expect(promise).to.be.a('promise');
        });

        it('should handle an error executing command', () => {
            const SSH = proxyquire('../../../lib/transfer/SSH', {
                ssh2 : {
                    Client : ClientCmdFail
                }
            });

            instance = new SSH();

            const promise = instance.execCommand('foo');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Cmd execution failed');
                });
        });

        it('should fully resolve', () => {
            instance = new SSH();

            const promise = instance.execCommand('foo');

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle stream error', () => {
            const SSH = proxyquire('../../../lib/transfer/SSH', {
                ssh2 : {
                    Client : ClientStreamFail
                }
            });

            instance = new SSH();

            const promise = instance.execCommand('foo');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(() => {
                    expect(true).to.be.true;
                });
        });

        it('should log command execution data', () => {
            const mock = sinon.mock(Logger);
            const SSH  = proxyquire('../../../lib/transfer/SSH', {
                ssh2 : {
                    Client : ClientProgress
                }
            });

            instance = new SSH();

            mock.expects('doOutput').never();

            const promise = instance.execCommand('foo');

            return promise
                .then(() => {
                    expect(Logger.$log).to.have.lengthOf(2);

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should log command execution data as a buffer', () => {
            const mock = sinon.mock(Logger);
            const SSH  = proxyquire('../../../lib/transfer/SSH', {
                ssh2 : {
                    Client : ClientProgressBuffer
                }
            });

            instance = new SSH();

            mock.expects('doOutput').never();

            const promise = instance.execCommand('foo');

            return promise
                .then(() => {
                    expect(Logger.$log).to.have.lengthOf(2);

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should log stream error', () => {
            const mock = sinon.mock(Logger);
            const SSH  = proxyquire('../../../lib/transfer/SSH', {
                ssh2 : {
                    Client : ClientStreamFail
                }
            });

            mock.expects('doOutput').never();

            instance = new SSH();

            const promise = instance.execCommand('foo');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(() => {
                    expect(Logger.$log).to.have.lengthOf(2);

                    mock.verify();
                });
        });

        it('should log stream error as a buffer', () => {
            const mock = sinon.mock(Logger);
            const SSH  = proxyquire('../../../lib/transfer/SSH', {
                ssh2 : {
                    Client : ClientStreamFailBuffer
                }
            });

            mock.expects('doOutput').never();

            instance = new SSH();

            const promise = instance.execCommand('foo');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(() => {
                    expect(Logger.$log).to.have.lengthOf(2);

                    mock.verify();
                });
        });
    });
});
