const { expect }  = require('chai');
const proxyquire  = require('proxyquire');
const sinon       = require('sinon');

const { util : { Logger } } = require('../../../');

describe('Logger', () => {
    describe('init', () => {
        it('should return a promise', () => {
            const promise = Logger.init('ERROR');

            expect(promise).to.be.a('promise');
        });

        it('init logger with proper level', () => {
            const promise = Logger.init('ERROR');

            return promise
                .then(() => {
                    expect(Logger).to.have.property('level', 4);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should default to ALL level', () => {
            const promise = Logger.init('NOTHING');

            return promise
                .then(() => {
                    expect(Logger).to.have.property('level', 0);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should default to INFO level', () => {
            const promise = Logger.init();

            return promise
                .then(() => {
                    expect(Logger).to.have.property('level', 2);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should init logger with lowercase level', () => {
            const promise = Logger.init('error');

            return promise
                .then(() => {
                    expect(Logger).to.have.property('level', 4);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    it('doesn\'t log anything if type of output is less than configurated one', () => {
        Logger.init('INFO');

        const stub = sinon.stub(console, 'log');

        Logger.init('ERROR');
        Logger.log('INFO', 1);

        expect(stub).not.to.be.called;

        stub.restore();
    });

    describe('indent', () => {
        beforeEach(() => {
            Logger.indentLevel = 0;
            Logger.level       = 0;
        });

        it('should indent output', () => {
            const mock = sinon.mock(Logger);

            Logger.indent(4);

            expect(Logger).to.have.property('indentLevel', 4);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('INFO:      foo');

            Logger.info('foo');

            Logger.indent(-4);

            expect(Logger).to.have.property('indentLevel', 0);

            mock.verify();
        });

        it('should not allow negative indention', () => {
            Logger.indent(4);

            expect(Logger).to.have.property('indentLevel', 4);

            Logger.indent(-5);

            expect(Logger).to.have.property('indentLevel', 0);
        });
    });

    describe('log', () => {
        it('should output log', () => {
            const mock = sinon.mock(Logger);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('INFO:  foo');

            Logger.log('INFO', 'foo');

            mock.verify();
        });

        it('should handle an error being passed', () => {
            const mock = sinon.mock(Logger);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('ERROR: foo');

            Logger.log('ERROR', new Error('foo'));

            mock.verify();
        });

        it('should stringify an array being passed', () => {
            const mock = sinon.mock(Logger);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('INFO:  ');

            Logger.log('INFO', []);

            mock.verify();
        });

        it('should stringify an object being passed', () => {
            const mock = sinon.mock(Logger);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('INFO:  [object Object]');

            Logger.log('INFO', {});

            mock.verify();
        });

        it('should stringify a function being passed', () => {
            const mock = sinon.mock(Logger);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('INFO:  function foo() {}');

            Logger.log('INFO', function foo () {}); // eslint-disable-line prefer-arrow-callback,no-empty-function

            mock.verify();
        });

        it('should stringify a boolean being passed', () => {
            const mock = sinon.mock(Logger);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('INFO:  true');

            Logger.log('INFO', true);

            mock.verify();
        });

        it('should log null being passed', () => {
            const mock = sinon.mock(Logger);

            mock
                .expects('doOutput')
                .once()
                .withExactArgs('INFO:  ');

            Logger.log('INFO', null);

            mock.verify();
        });
    });

    describe('doOutput', () => {
        it('should output a string message', () => {
            const mock = sinon.mock(Logger);

            mock.expects('_output').once();

            Logger.doOutput('INFO:  test');

            mock.verify();
        });

        it('should output an object message', () => {
            const mock = sinon.mock(Logger);

            mock.expects('_output').once();

            Logger.doOutput({
                level     : 4,
                levelStr  : 'ERROR',
                message   : 'foo',
                timestamp : new Date()
            });

            mock.verify();
        });
    });

    describe('output', () => {
        it('should support stdout', () => {
            const { output } = Logger;

            expect(output).to.equal(console.log);
        });
    });

    describe('formatMessage', () => {
        it('should format message with timestamp', () => {
            const date    = new Date();
            const message = {
                level     : 2,
                levelStr  : 'INFO',
                message   : 'Testing',
                timestamp : date
            };

            const formatted = Logger.formatMessage(true, message);

            expect(formatted).to.equal(`[${date.toISOString()}] INFO:  Testing`);
        });

        it('should format message without timestamp', () => {
            const date    = new Date();
            const message = {
                level     : 2,
                levelStr  : 'INFO',
                message   : 'Testing',
                timestamp : date
            };

            const formatted = Logger.formatMessage(false, message);

            expect(formatted).to.equal(`INFO:  Testing`);
        });

        it('should format message with a string timestamp', () => {
            const message = {
                level     : 2,
                levelStr  : 'INFO',
                message   : 'Testing',
                timestamp : 'foobar'
            };

            const formatted = Logger.formatMessage(true, message);

            expect(formatted).to.equal(`[foobar] INFO:  Testing`);
        });

        it('should pad with error level', () => {
            const date    = new Date();
            const message = {
                level     : 4,
                levelStr  : 'ERROR',
                message   : 'Testing',
                timestamp : date
            };

            const formatted = Logger.formatMessage(false, message);

            expect(formatted).to.equal(`ERROR: Testing`);
        });

        it('should pad with info level', () => {
            const date    = new Date();
            const message = {
                level     : 2,
                levelStr  : 'INFO',
                message   : 'Testing',
                timestamp : date
            };

            const formatted = Logger.formatMessage(false, message);

            expect(formatted).to.equal(`INFO:  Testing`);
        });
    });

    describe('toFile', () => {
        it('should write all log to a file', () => {
            const date      = new Date();
            const fileStub  = sinon.stub().withArgs('/foo/text.txt', `[${date.toISOString()}] INFO:  foo\n[${date.toISOString()}] DEBUG: bar`);
            const mkdirStub = sinon.stub().withArgs('/foo');
            const Logger    = proxyquire(
                '../../../lib/util/Logger',
                {
                    fs : {
                        writeFileSync : fileStub
                    },
                    mkdirp : {
                        sync : mkdirStub
                    }
                }
            );

            return Logger
                .init('INFO')
                .then(() => {
                    Logger.$log.push(
                        {
                            level     : 2,
                            levelStr  : 'INFO',
                            message   : 'foo',
                            timestamp : date
                        },
                        {
                            level     : 1,
                            levelStr  : 'DEBUG',
                            message   : 'bar',
                            timestamp : date
                        }
                    );

                    Logger.toFile('/foo/text.txt');

                    expect(fileStub).to.be.called;
                    expect(mkdirStub).to.be.called;
                });
        });

        it('should not write all log to a file', () => {
            const date      = new Date();
            const fileStub  = sinon.stub().withArgs('/foo/text.txt', `[${date.toISOString()}] INFO:  foo`);
            const mkdirStub = sinon.stub().withArgs('/foo');
            const Logger    = proxyquire(
                '../../../lib/util/Logger',
                {
                    fs : {
                        writeFileSync : fileStub
                    },
                    mkdirp : {
                        sync : mkdirStub
                    }
                }
            );

            return Logger
                .init('INFO')
                .then(() => {
                    Logger.$log.push(
                        {
                            level     : 2,
                            levelStr  : 'INFO',
                            message   : 'foo',
                            timestamp : date
                        },
                        {
                            level     : 1,
                            levelStr  : 'DEBUG',
                            message   : 'bar',
                            timestamp : date
                        }
                    );

                    Logger.toFile('/foo/text.txt', 2);

                    expect(fileStub).to.be.called;
                    expect(mkdirStub).to.be.called;
                });
        });
    });
});
