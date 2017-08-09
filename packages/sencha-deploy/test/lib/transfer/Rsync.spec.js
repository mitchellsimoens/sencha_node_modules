const { expect } = require('chai');
const proxyquire = require('proxyquire');

const { transfer : { Rsync } } = require('../../../');

describe('Rsync', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Rsync();
        });

        it('should call superclass', function () {
            expect(instance).to.have.property('config');
        });

        it('should set own properties', function () {
            //expect(instance).to.have.deep.property('config.flags', 'z');
            expect(instance.config).to.have.property('flags', 'z');
            //expect(instance).to.have.deep.property('config.shell', 'ssh');
            expect(instance.config).to.have.property('shell', 'ssh');
        });
    });

    describe('upload', function () {
        it('should return a promise', function () {
            const fakeRsync = function fakeRsync() {
                return this;
            };

            fakeRsync.prototype.execute = this.sandbox.stub().callsArgWith(0);

            fakeRsync.prototype.shell       =
            fakeRsync.prototype.flags       =
            fakeRsync.prototype.source      =
            fakeRsync.prototype.destination =
                function () {
                    return this;
                };

            const Rsync = proxyquire(
                '../../../lib/transfer/Rsync',
                {
                    rsync : fakeRsync
                }
            );

            instance = new Rsync({
                destination : '/bar/foo',
                source      : '/foo/bar'
            });

            const promise = instance.upload();

            expect(promise).to.be.a('promise');

            return promise;
        });

        it('should parse key if passed', function () {
            const fakeRsync = function fakeRsync() {
                return this;
            };

            fakeRsync.prototype.execute = this.sandbox.stub().callsArgWith(0);

            fakeRsync.prototype.shell       =
            fakeRsync.prototype.flags       =
            fakeRsync.prototype.source      =
            fakeRsync.prototype.destination =
                function () {
                    return this;
                };

            const stub = fakeRsync.prototype.set = this.sandbox.stub();

            const Rsync = proxyquire(
                '../../../lib/transfer/Rsync',
                {
                    rsync : fakeRsync
                }
            );

            Rsync.prototype.parseKey = (key) => {
                return key;
            };

            instance = new Rsync({
                destination : '/bar/foo',
                key         : 'mykey',
                source      : '/foo/bar'
            });

            const promise = instance.upload();

            expect(promise).to.be.a('promise');

            expect(stub).to.be.calledOnce;

            return promise;
        });

        it('should handle rsync error', function () {
            const fakeRsync = function fakeRsync() {
                return this;
            };

            fakeRsync.prototype.execute = this.sandbox.stub().callsArgWith(0, new Error('foo'));

            fakeRsync.prototype.shell       =
            fakeRsync.prototype.flags       =
            fakeRsync.prototype.source      =
            fakeRsync.prototype.destination =
                function () {
                    return this;
                };

            const Rsync = proxyquire(
                '../../../lib/transfer/Rsync',
                {
                    rsync : fakeRsync
                }
            );

            instance = new Rsync({
                destination : '/bar/foo',
                source      : '/foo/bar'
            });

            const promise = instance.upload();

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');
                });
        })
    });
});
