const { expect } = require('chai');
const { S3 }     = require('../../');
const proxyquire = require('proxyquire');

describe('S3', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        it('should be an S3 instance', function () {
            instance = new S3();

            expect(instance).to.have.property('isS3',  true);
            expect(instance).to.have.property('isAWS', true);
        });
    });

    describe('ctor', function () {
        it('should create aws.s3 instance', function () {
            let executed;

            class FakeS3 {
                constructor (config) {
                    executed = config;
                }
            }

            const S3 = proxyquire(
                '../../S3',
                {
                    'aws-sdk' : {
                        S3 : FakeS3
                    }
                }
            );

            instance = new S3();

            expect(instance).to.have.property('s3');

            expect(executed).to.be.an('object');
            expect(executed).to.be.empty;
        });

        it('should create aws.s3 instance with bucket', function () {
            let executed;

            class FakeS3 {
                constructor (config) {
                    executed = config;
                }
            }

            const S3 = proxyquire(
                '../../S3',
                {
                    'aws-sdk' : {
                        S3 : FakeS3
                    }
                }
            );

            instance = new S3({
                bucket : 'mybucket'
            });

            expect(instance).to.have.property('s3');

            expect(executed).to.be.an('object');
            expect(executed.params).to.have.deep.property('Bucket', 'mybucket');
        });

        it('should create aws.s3 instance with key', function () {
            let executed;

            class FakeS3 {
                constructor (config) {
                    executed = config;
                }
            }

            const S3 = proxyquire(
                '../../S3',
                {
                    'aws-sdk' : {
                        S3 : FakeS3
                    }
                }
            );

            instance = new S3({
                key : 'mykey'
            });

            expect(instance).to.have.property('s3');

            expect(executed).to.be.an('object');
            expect(executed).to.have.property('accessKeyId', 'mykey');
        });

        it('should create aws.s3 instance with secret', function () {
            let executed;

            class FakeS3 {
                constructor (config) {
                    executed = config;
                }
            }

            const S3 = proxyquire(
                '../../S3',
                {
                    'aws-sdk' : {
                        S3 : FakeS3
                    }
                }
            );

            instance = new S3({
                secret : 'mysecret'
            });

            expect(instance).to.have.property('s3');

            expect(executed).to.be.an('object');
            expect(executed).to.have.property('secretAccessKey', 'mysecret');
        });
    });

    describe('static defaultType', function () {
        afterEach(function () {
            S3.defaultType = undefined;
        });

        describe('get', function () {
            it('should return the default defaultType', function () {
                expect(S3).to.have.property('defaultType', 'application/octet-stream');
            });

            it('should return a set defaultType', function () {
                S3.defaultType = 'text/plain';

                expect(S3).to.have.property('defaultType', 'text/plain');
            });
        });

        describe('set', function () {
            it('should set defaultType', function () {
                S3.defaultType = 'text/plain';

                expect(S3).to.have.property('defaultType', 'text/plain');
            });

            it('should unset a set defaultType', function () {
                S3.defaultType = 'text/plain';

                expect(S3).to.have.property('defaultType', 'text/plain');

                S3.defaultType = undefined;

                expect(S3).to.have.property('defaultType', 'application/octet-stream');
            });
        });
    });

    describe('static getMimeType', function () {
        it('should return the default type if no file is passed', function () {
            const type = S3.getMimeType();

            expect(type).to.equal('application/octet-stream');
            expect(type).to.equal(S3.defaultType);
        });

        describe('string', function () {
            it('should return type with simple string', function () {
                const type = S3.getMimeType('foo.png');

                expect(type).to.equal('image/png');
            });

            it('should return type with nested string', function () {
                const type = S3.getMimeType('/foo/bar/baz.zip');

                expect(type).to.equal('application/zip');
            });
        });

        describe('object', function () {
            it('should return type with name', function () {
                const type = S3.getMimeType({
                    name : 'foo.doc'
                });

                expect(type).to.equal('application/msword');
            });

            it('should execute getter for mime_type field', function () {
                const get = this.sandbox.stub().returns('foo');

                const type = S3.getMimeType({
                    get
                });

                expect(type).to.equal('foo');

                expect(get).to.have.been.calledOnce;

                get.should.have.been.calledWith('mime_type');
            });

            it('should execute getter for type field', function () {
                const get = this.sandbox.stub();

                get.onCall(0).returns(undefined);
                get.onCall(1).returns('foo');

                const type = S3.getMimeType({
                    get
                });

                expect(type).to.equal('foo');

                expect(get).to.have.been.calledTwice;

                get.firstCall.should.have.been.calledWith('mime_type');
                get.secondCall.should.have.been.calledWith('type');
            });

            it('should execute getter for name field', function () {
                const get = this.sandbox.stub();

                get.onCall(0).returns(undefined);
                get.onCall(1).returns(undefined);
                get.onCall(2).returns('/foo/bar/test.xlsx');

                const type = S3.getMimeType({
                    get
                });

                expect(type).to.equal('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

                expect(get).to.have.been.calledThrice;

                get.firstCall.should.have.been.calledWith('mime_type');
                get.secondCall.should.have.been.calledWith('type');
                get.thirdCall.should.have.been.calledWith('name');
            });

            it('should return default type if getters do not return something', function () {
                const get = this.sandbox.stub();

                get.onCall(0).returns(undefined);
                get.onCall(1).returns(undefined);
                get.onCall(2).returns('/foo/bar/test.blahblah');

                const type = S3.getMimeType({
                    get
                });

                expect(type).to.equal('application/octet-stream');
                expect(type).to.equal(S3.defaultType);

                expect(get).to.have.been.calledThrice;

                get.firstCall.should.have.been.calledWith('mime_type');
                get.secondCall.should.have.been.calledWith('type');
                get.thirdCall.should.have.been.calledWith('name');
            });
        });
    });

    describe('getFile', function () {
        it('should execute getObject', function () {
            instance = new S3();

            const stub   = this.sandbox
                .stub(instance.s3, 'getObject')
                .returns('foo');
            const result = instance.getFile('mykey');

            stub.should.have.been.calledWith({ Key : 'mykey' });
            expect(result).to.equal('foo');
        });
    });

    describe('getFilePromise', function () {
        it('should return a promise', function () {
            instance = new S3();

            const promise = this.sandbox.stub().resolves('foo');
            const stub    = this.sandbox
                .stub(instance.s3, 'getObject')
                .returns({
                    promise
                });
            const result  = instance.getFilePromise('mykey');

            stub.should.have.been.calledWith({ Key : 'mykey' });
            expect(result).to.be.a('promise');
        });
    });

    describe('getFileStream', function () {
        it('should return a "stream"', function () {
            instance = new S3();

            const stream = this.sandbox.stub().returns('stream');
            const stub   = this.sandbox
                .stub(instance.s3, 'getObject')
                .returns({
                    createReadStream : stream
                });
            const result = instance.getFileStream('mykey');

            stub.should.have.been.calledWith({ Key : 'mykey' });
            expect(result).to.equal('stream');
        });
    });

    describe('createFile', function () {
        it('should not attempt to upload a file', function () {
            instance = new S3();

            const send   = this.sandbox.stub();
            const stub   = this.sandbox
                .stub(instance.s3, 'upload')
                .returns({
                    send
                });
            const result = instance.createFile(null, 'mykey');

            expect(result).to.be.a('promise');
            expect(send).to.not.have.been.called;
            expect(stub).to.not.have.been.called;

            return result
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Invalid file input');
                });
        });

        it('should upload a file', function () {
            instance = new S3();

            const send   = this.sandbox.stub();
            const stub   = this.sandbox
                .stub(instance.s3, 'upload')
                .returns({
                    send
                });
            const result = instance.createFile({ foo : 'bar' }, 'mykey');

            expect(result).to.be.a('promise');
            expect(send).to.have.been.called;
            stub.should.have.been.calledWith({
                Key  : 'mykey',
                Body : { foo : 'bar' }
            });
        });

        it('should upload a file passing a string', function () {
            const send   = this.sandbox.stub();
            const stream = this.sandbox.stub().returns('myfile content');
            const S3     = proxyquire(
                '../../S3',
                {
                    fs : {
                        createReadStream : stream
                    }
                }
            );

            instance = new S3();

            const stub   = this.sandbox
                .stub(instance.s3, 'upload')
                .returns({
                    send
                });
            const result = instance.createFile('myfile', 'mykey');

            expect(result).to.be.a('promise');
            expect(send).to.have.been.called;
            stream.should.have.been.calledWith('myfile');
            stub.should.have.been.calledWith({
                Key  : 'mykey',
                Body : 'myfile content'
            });
        });

        it('should handle an upload failure', function () {
            instance = new S3();

            const send   = this.sandbox.stub().callsArgWith(0, new Error('upload error'));
            const stub   = this.sandbox
                .stub(instance.s3, 'upload')
                .returns({
                    send
                });
            const result = instance.createFile({ foo : 'bar' }, 'mykey');

            expect(result).to.be.a('promise');
            expect(send).to.have.been.called;
            stub.should.have.been.calledWith({
                Key  : 'mykey',
                Body : { foo : 'bar' }
            });

            return result
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('upload error');
                });
        });

        it('should handle an upload failure', function () {
            instance = new S3();

            const send   = this.sandbox.stub().callsArgWith(0, null, 'good upload');
            const stub   = this.sandbox
                .stub(instance.s3, 'upload')
                .returns({
                    send
                });
            const result = instance.createFile({ foo : 'bar' }, 'mykey');

            expect(result).to.be.a('promise');
            expect(send).to.have.been.called;
            stub.should.have.been.calledWith({
                Key  : 'mykey',
                Body : { foo : 'bar' }
            });

            return result
                .then(ret => {
                    expect(ret).to.equal('good upload');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('deleteFile', function () {
        it('should execute deleteObject', function () {
            instance = new S3();

            const stub   = this.sandbox
                .stub(instance.s3, 'deleteObject')
                .returns('foo');
            const result = instance.deleteFile('mykey');

            stub.should.have.been.calledWith({ Key : 'mykey' });
            expect(result).to.equal('foo');
        });
    });

    describe('deleteFilePromise', function () {
        it('should return a promise', function () {
            instance = new S3();

            const promise = this.sandbox.stub().resolves('foo');
            const stub    = this.sandbox
                .stub(instance.s3, 'deleteObject')
                .returns({
                    promise
                });
            const result  = instance.deleteFilePromise('mykey');

            stub.should.have.been.calledWith({ Key : 'mykey' });
            expect(result).to.be.a('promise');
        });
    });

    describe('getSignedUrl', function () {
        it('should get a signed url', function () {
            instance = new S3({
                bucket : 'foo'
            });

            const stub   = this.sandbox
                .stub(instance.s3, 'getSignedUrl')
                .returns('https://foo.com');
            const result = instance.getSignedUrl('mykey');

            stub.should.have.been.calledWith('getObject', { Key : 'mykey', Expires : 30, Bucket : 'foo' });
            expect(result).to.equal('https://foo.com');
        });

        it('should get an expired url', function () {
            instance = new S3({
                bucket : 'foo'
            });

            const stub   = this.sandbox
                .stub(instance.s3, 'getSignedUrl')
                .returns('https://foo.com');
            const result = instance.getSignedUrl('mykey', {
                Expires : 10
            });

            stub.should.have.been.calledWith('getObject', { Key : 'mykey', Expires : 10, Bucket : 'foo' });
            expect(result).to.equal('https://foo.com');
        });
    });
});
