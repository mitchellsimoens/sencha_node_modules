const { expect } = require('chai');
const proxyquire = require('proxyquire');

const { step : { HashFile } } = require('../../../');

describe('HashFile step', function () {
    describe('hash', function () {
        it('should produce sha1', function * () {
            const hash_stub = this.sandbox
                .stub()
                .callsArgWith(1, null, 'sha1');

            const Module    = proxyquire(
                '../../../lib/step/HashFile',
                {
                    'hash-files' : hash_stub
                }
            );

            const instance = new Module();
            const res      = yield instance.hash('path');

            expect(res).to.equal('sha1');

            expect(hash_stub.args[0][0]).to.have.property('algorithm', 'sha1');
        });

        it('should produce md5', function * () {
            const hash_stub = this.sandbox
                .stub()
                .callsArgWith(1, null, 'md5');

            const Module    = proxyquire(
                '../../../lib/step/HashFile',
                {
                    'hash-files' : hash_stub
                }
            );

            const instance = new Module();
            const res      = yield instance.hash('path', 'md5');

            expect(res).to.equal('md5');

            expect(hash_stub.args[0][0]).to.have.property('algorithm', 'md5');
        });

        it('should handle unknown algorithm', function () {
            const instance = new HashFile();
            const res      = instance.hash('path', 'invalid');

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Invalid algorithm. Please use one of the following: md5, sha, sha1, sha224, sha256, sha384, sha512');
                });
        });

        it('should handle an error', function () {
            const hash_stub = this.sandbox
                .stub()
                .callsArgWith(1, new Error('foo'), 'hashed');

            const HashFile = proxyquire(
                '../../../lib/step/HashFile',
                {
                    'hash-files' : hash_stub
                }
            );

            const instance = new HashFile();
            const res      = instance.hash('path', 'md5');

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        });
    });

    describe('execute', function () {
        it('should execute successfully', function * () {
            const hash_stub = this.sandbox
                .stub()
                .callsArgWith(1, null, 'hashed');

            const Module    = proxyquire(
                '../../../lib/step/HashFile',
                {
                    'hash-files' : hash_stub
                }
            );

            const runner  = {
                info : {
                    args : {
                        path : 'path'
                    }
                }
            };
            const instance = new Module();
            const res      = instance.execute(runner);

            return res
                .then(() => {
                    //expect(runner).to.have.deep.property('info.file.md5',  'hashed');
                    expect(runner.info.file).to.have.property('md5',  'hashed');
                    //expect(runner).to.have.deep.property('info.file.sha1', 'hashed');
                    expect(runner.info.file).to.have.property('sha1', 'hashed');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });
});
