const { expect } = require('chai');

const {
    storage : { Storage },
    util    : { Logger }
} = require('../../../');

const fakeStorageAdapter = function (config) {
    Object.assign(this, config);

    return this;
};

describe('Storage', function () {
    describe('instantiation', function () {
        it('should create storage instance', function () {
            const storage = new Storage();

            expect(storage.config).to.be.undefined;
        });

        it('should create storage instance with config', function () {
            const storage = new Storage({
                queueSize : 10
            });

            //expect(storage).to.have.deep.property('config.queueSize', 10);
            expect(storage.config).to.have.property('queueSize', 10);
        });

        it('should create storage passing config in constructor', function () {
            const storage = new Storage({
                queueSize : 10
            });

            storage.create(fakeStorageAdapter);

            //expect(storage).to.have.deep.property('storage.queueSize', 10);
            expect(storage.storage).to.have.property('queueSize', 10);
        });

        it('should create storage passing config in create method', function () {
            const storage = new Storage();

            storage.create(
                fakeStorageAdapter,
                {
                    queueSize : 10
                }
            );

            //expect(storage).to.have.deep.property('storage.queueSize', 10);
            expect(storage.storage).to.have.property('queueSize', 10);
        });
    });

    describe('ping', function () {
        it('should ping storage', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const storage = new Storage({});

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeStorageAdapter, {
                ping : sandbox.stub().resolves()
            });

            storage.create(Cls);

            const promise = storage.ping();

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should not ping storage', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const storage = new Storage({});

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeStorageAdapter, {
                ping : sandbox.stub().rejects(new Error('foo'))
            });

            storage.create(Cls);

            const promise = storage.ping();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Unable to connect to the storage.');
                });
        });
    });

    describe('upload', function () {
        it('should upload to storage', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const storage = new Storage({});

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeStorageAdapter, {
                upload : sandbox.stub().resolves()
            });

            storage.create(Cls);

            const promise = storage.upload();

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle an error in upload', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const storage = new Storage({});

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeStorageAdapter, {
                upload : sandbox.stub().rejects(new Error('foo'))
            });

            storage.create(Cls);

            const promise = storage.upload();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Unable to upload to the storage.');
                });
        });
    });

    describe('remove', function () {
        it('should remove from storage', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const storage = new Storage({});

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeStorageAdapter, {
                remove : sandbox.stub().resolves()
            });

            storage.create(Cls);

            const promise = storage.remove();

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle an error in removal', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const storage = new Storage({});

            const Cls = this[ 'sencha-deploy' ].cloneFunction(fakeStorageAdapter, {
                remove : sandbox.stub().rejects(new Error('foo'))
            });

            storage.create(Cls);

            const promise = storage.remove();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Unable to remove the file from storage.');
                });
        });
    });
});
