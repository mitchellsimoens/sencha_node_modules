const AWS        = require('aws-sdk');
const { expect } = require('chai');
const fs         = require('fs');
const proxyquire = require('proxyquire');
const zlib       = require('zlib');

const {
    storage : { S3 },
    util    : { Logger }
} = require('../../../');

const _config = {
    queueSize : 4,
    partSize  : 5
};

const _env = {
    S3_BUCKET : 'my-bucket',
    S3_KEY    : 'my-key',
    S3_SECRET : 'my-secret'
};

describe('S3', function () {
    let s3;

    beforeEach(function () {
        this.sandbox.stub(process, 'env').value(_env);
    });

    afterEach(function () {
        s3 = null;
    });

    describe('instantiation', function () {
        it('should have default config values', function () {
            s3 = new S3();

            expect(s3).to.have.property('queueSize', 20);
            expect(s3).to.have.property('partSize',  10);
        });

        it('should have config values', function () {
            s3 = new S3(_config);

            expect(s3).to.have.property('queueSize', 4);
            expect(s3).to.have.property('partSize',  5);
        });

        it('should have process env values', function () {
            s3 = new S3(_config);

            expect(s3).to.have.property('bucket', 'my-bucket');
            expect(s3).to.have.property('key',    'my-key');
            expect(s3).to.have.property('secret', 'my-secret');
        });

        it('should pass values to AWS', function () {
            const { sandbox } = this;
            const stub        = sandbox.stub(AWS.config, 'update').callsFake(() => {});

            s3 = new S3(_config);

            expect(stub).to.be.called;
            expect(stub.args[0][0]).to.have.property('accessKeyId',     'my-key');
            expect(stub.args[0][0]).to.have.property('secretAccessKey', 'my-secret');
        });
    });

    describe('s3', function () {
        it('should create s3 instance', function () {
            s3 = new S3();

            expect(s3).to.have.property('s3');
        });

        it('should already have an s3 instance', function () {
            s3 = new S3();

            s3.s3 = 'foo';

            expect(s3).to.have.property('s3', 'foo');
        });
    });

    describe('getBucketFromInfo', function () {
        it('should get bucket info from instance', function () {
            s3 = new S3();

            s3.bucket = 'foo';

            const bucket = s3.getBucketFromInfo();

            expect(bucket).to.equal('foo');
        });

        it('should get bucket info from arg', function () {
            s3 = new S3();

            const bucket = s3.getBucketFromInfo({
                s3 : {
                    bucket : 'bar'
                }
            });

            expect(bucket).to.equal('bar');
        });
    });

    describe('ping', function () {
        it('should ping S3 bucket', function * () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const headBucket_stub = sandbox.stub().callsArgWith(1, null);
            const s3_stub         = sandbox.stub().returns({
                headBucket : headBucket_stub
            });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            yield s3.ping();

            expect(headBucket_stub).to.be.called;
        });

        it('should handle generic S3 error', function () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const headBucket_stub = sandbox.stub().callsArgWith(1, {});
            const s3_stub         = sandbox.stub().returns({
                headBucket : headBucket_stub
            });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            const promise = s3.ping();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Error connecting to S3: Unable to connect to S3');
                    expect(headBucket_stub).to.be.called;
                });
        });

        it('should handle 403 S3 error', function () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const headBucket_stub = sandbox.stub().callsArgWith(1, {
                statusCode : 403
            });
            const s3_stub         = sandbox.stub().returns({
                headBucket : headBucket_stub
            });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            const promise = s3.ping();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Error connecting to S3: Credentials are invalid or no permissions to access the specified Bucket');
                    expect(headBucket_stub).to.be.called;
                });
        });

        it('should handle 404 S3 error', function () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const headBucket_stub = sandbox.stub().callsArgWith(1, {
                statusCode : 404
            });
            const s3_stub         = sandbox.stub().returns({
                headBucket : headBucket_stub
            });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            const promise = s3.ping();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Error connecting to S3: Bucket not found');
                    expect(headBucket_stub).to.be.called;
                });
        });
    });

    describe('upload', function () {
        const info = {
            args      : {
                path : 'path'
            },
            file      : {
                sha1 : 'sha1'
            },
            moduleCfg : {}
        };

        it('should return an error if path is not readable', function () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const s3             = new S3(_config);
            const err_event_stub = sandbox
                .stub()
                .callsArgWith(
                    1,
                    new Error('foo')
                );

            sandbox.stub(fs, 'createReadStream').callsFake(() => {
                return {
                    on : err_event_stub
                };
            });

            const res = s3.upload(info);

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        });

        it('should upload a file and show the progress', function * () {
            const { sandbox }    = this;
            const init_stub      = sandbox.stub(AWS.config, 'update').callsFake(() => {});
            const s3_upload_send = sandbox
                .stub()
                .callsArgWith(
                    0,
                    null,
                    {
                        foo : 'bar'
                    }
                );
            const s3_upload_emit = sandbox
                .stub()
                .callsArgWith(
                    1,
                    {
                        loaded : 5
                    }
                )
                .returns({
                    send : s3_upload_send
                });
            const s3_upload      = sandbox
                .stub()
                .returns({
                    on : s3_upload_emit
                });
            const s3_stub        = sandbox
                .stub()
                .returns({
                    upload : s3_upload
                });
            const stream_pipe    = sandbox.stub();
            const fs_stub        = sandbox.stub(fs, 'createReadStream').callsFake(() => {
                return {
                    on : () => {
                        return {
                            pipe : stream_pipe
                        }
                    }
                };
            });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            yield s3.upload(info);

            expect(init_stub).to.be.called;
            expect(fs_stub).to.be.called;
            expect(s3_stub).to.be.called;
            expect(s3_upload).to.be.called;
            expect(s3_upload_emit).to.be.called;
            expect(s3_upload_emit.args[0][0]).to.eql('httpUploadProgress');
            expect(s3_upload_send).to.be.called;

            mock.verify();
        });

        it('should upload a file with a prefix', function * () {
            const { sandbox } = this;
            const init_stub      = sandbox.stub(AWS.config, 'update').callsFake(() => {});
            const s3_upload_send = sandbox
                .stub()
                .callsArgWith(
                    0,
                    null,
                    {
                        foo : 'bar'
                    }
                );
            const s3_upload_emit = sandbox
                .stub()
                .callsArgWith(
                    1,
                    {
                        loaded : 5
                    }
                )
                .returns({
                    send : s3_upload_send
                });
            const s3_upload      = sandbox
                .stub()
                .returns({
                    on : s3_upload_emit
                });
            const s3_stub        = sandbox
                .stub()
                .returns({
                    upload : s3_upload
                });
            const stream_pipe    = sandbox.stub();
            const fs_stub        = sandbox.stub(fs, 'createReadStream').callsFake(() => {
                return {
                    on : () => {
                        return {
                            pipe : stream_pipe
                        }
                    }
                };
            });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            yield s3.upload(
                Object.assign({}, info, {
                    moduleCfg : {
                        s3 : {
                            prefix : 'foo-'
                        }
                    }
                })
            );

            expect(init_stub).to.be.called;
            expect(fs_stub).to.be.called;
            expect(s3_stub).to.be.called;
            expect(s3_upload).to.be.called;
            expect(s3_upload_emit).to.be.called;
            expect(s3_upload_emit.args[0][0]).to.eql('httpUploadProgress');
            expect(s3_upload_send).to.be.called;

            mock.verify();
        });

        it('should return an error if upload failed', function () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const stream_pipe    = sandbox.stub();
            const s3_upload_send = sandbox
                .stub()
                .callsArgWith(
                    0,
                    new Error('foo')
                );
            const s3_upload_emit = sandbox
                .stub()
                .callsArgWith(
                    1,
                    {
                        loaded : 5
                    }
                )
                .returns({
                    send : s3_upload_send
                });
            const s3_upload      = sandbox
                .stub()
                .returns({
                    on : s3_upload_emit
                });
            const s3_stub        = sandbox
                .stub()
                .returns({
                    upload : s3_upload
                });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            sandbox.stub(zlib, 'createGzip');
            sandbox.stub(fs,  'createReadStream').callsFake(() => {
                return {
                    on : () => {
                        return {
                            pipe : stream_pipe
                        }
                    }
                };
            });

            const mock = sandbox.mock(Logger);

            mock.expects('log').thrice();

            const res = s3.upload(info);

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        });

        it('should should progress', function * () {
            const { sandbox } = this;
            const init_stub      = sandbox.stub(AWS.config, 'update').callsFake(() => {});
            const s3_upload_send = sandbox
                .stub()
                .callsArgWith(
                    0,
                    null,
                    {
                        foo    : 'bar'
                    }
                );
            const s3_upload_emit = sandbox
                .stub()
                .callsArgWith(
                    1,
                    {
                        loaded : 5,
                        total  : 10
                    }
                )
                .returns({
                    send : s3_upload_send
                });
            const s3_upload      = sandbox
                .stub()
                .returns({
                    on : s3_upload_emit
                });
            const s3_stub        = sandbox
                .stub()
                .returns({
                    upload : s3_upload
                });
            const stream_pipe    = sandbox.stub();
            const fs_stub        = sandbox.stub(fs, 'createReadStream').callsFake(() => {
                return {
                    on : () => {
                        return {
                            pipe : stream_pipe
                        }
                    }
                };
            });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            const mock = sandbox.mock(Logger);

            mock.expects('log').once();

            yield s3.upload(info);

            expect(init_stub).to.be.called;
            expect(fs_stub).to.be.called;
            expect(s3_stub).to.be.called;
            expect(s3_upload).to.be.called;
            expect(s3_upload_emit).to.be.called;
            expect(s3_upload_emit.args[0][0]).to.eql('httpUploadProgress');
            expect(s3_upload_send).to.be.called;

            mock.verify();
        });
    });

    describe('remove', function () {
        const info = {
            args      : {
                path : 'path'
            },
            file      : {
                sha1 : 'sha1'
            },
            moduleCfg : {}
        };

        it('should remove object from S3', function * () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const s3_do   = sandbox.stub().callsArgWith(1, null);
            const s3_stub = sandbox
                .stub()
                .returns({
                    deleteObjects : s3_do
                });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            yield s3.remove(info);

            expect(s3_do).to.be.called;
        });

        it('should return an error if not able to remove an object from S3', function () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const s3_do   = sandbox
                .stub()
                .callsArgWith(
                    1,
                    new Error('foo')
                );
            const s3_stub = sandbox
                .stub()
                .returns({
                    deleteObjects : s3_do
                });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            const res = s3.remove(info);

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        });

        it('should remove object from S3 with a prefix', function * () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const s3_do   = sandbox.stub().callsArgWith(1, null);
            const s3_stub = sandbox
                .stub()
                .returns({
                    deleteObjects : s3_do
                });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            yield s3.remove(
                Object.assign({}, info, {
                    moduleCfg : {
                        s3 : {
                            prefix : 'foo-'
                        }
                    }
                })
            );

            expect(s3_do).to.be.called;
        });

        it('should remove object from S3 with a key', function * () {
            const { sandbox } = this;

            sandbox.stub(AWS.config, 'update').callsFake(() => {});

            const s3_do   = sandbox.stub().callsArgWith(1, null);
            const s3_stub = sandbox
                .stub()
                .returns({
                    deleteObjects : s3_do
                });

            const S3 = proxyquire(
                '../../../lib/storage/S3.js',
                {
                    'aws-sdk' : {
                        S3 : s3_stub
                    }
                }
            );

            s3 = new S3(_config);

            yield s3.remove(
                Object.assign({}, info, {
                    Key : 'foo'
                })
            );

            expect(s3_do).to.be.called;
        });
    });
});
