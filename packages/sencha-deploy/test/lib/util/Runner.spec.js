const { expect } = require('chai');

const {
    error : { FatalError },
    util  : { Logger, Runner }
} = require('../../../');

describe('Runner', function () {
    let instance;

    beforeEach(function () {
        instance = new Runner();
    });

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        it('should setup stack', function () {
            expect(instance.stack).to.be.an('array');
            expect(instance.stack).to.be.empty;
        });
    });

    describe('run', function () {
        it('should work with step with no name', function() {
            const mock = this.sandbox.mock(Logger);

            mock.expects('log').twice();

            instance.stack.push({});

            const promise = instance.run();

            return promise.then(() => {
                mock.verify();
            });
        });
    });

    describe('onStepFinish', function () {
        it('should print seconds', function () {
            const mock = this.sandbox.mock(Logger);

            mock.expects('log').once();

            instance.onStepFinish({
                $perf : [ 12, 999 ]
            });

            mock.verify();
        });

        it('should throw the FatalError', function () {
            const mock = this.sandbox.mock(Logger);

            mock.expects('log').once();

            const fn = () => {
                instance.onStepFinish({}, new FatalError('foo'));
            };

            expect(fn).to.throw(FatalError, 'foo');

            mock.verify();
        });
    });

    describe('onError', function () {
        it('should handle an error and reject a successful undo', function () {
            instance.index = 1;

            instance.stack.push({
                undo () {
                    return true;
                }
            });

            const promise = instance.onError(new Error('foo'));

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        });

        it('should handle an error and reject an unsuccessful undo', function () {
            instance.index = 1;

            instance.stack.push({
                undo () {
                    throw new Error('blah');
                }
            });

            const promise = instance.onError(new Error('foo'));

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        });
    });

    describe('undo', function () {
        it('should handle a promise', function () {
            instance.index = 1;

            instance.stack.push({
                undo () {
                    return new Promise((resolve) => {
                        setTimeout(resolve, 0);
                    });
                }
            });

            const promise = instance.undo();

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('addData', function () {
        it('should add data when no current info available', function () {
            instance.addData('foo', 'bar');

            //expect(instance).to.have.deep.property('$info.foo', 'bar');
            expect(instance.$info).to.have.property('foo', 'bar');
        });

        it('should add data to existing info', function () {
            instance.$info = {
                bar : 'baz'
            };

            instance.addData('foo', 'bar');

            //expect(instance).to.have.deep.property('$info.foo', 'bar');
            expect(instance.$info).to.have.property('foo', 'bar');
            //expect(instance).to.have.deep.property('$info.bar', 'baz');
            expect(instance.$info).to.have.property('bar', 'baz');
        });
    });

    describe('getData', function () {
        it('should get data from existing info', function () {
            instance.$info = {
                foo : 'bar'
            };

            const data = instance.getData('foo')

            expect(data).to.equal('bar');
        });

        it('should get data when no current info available', function () {
            const data = instance.getData('foo')

            expect(data).to.be.undefined;
        });
    });
});
