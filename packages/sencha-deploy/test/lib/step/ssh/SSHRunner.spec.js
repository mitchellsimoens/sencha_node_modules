const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    step : {
        ssh : {
            SSHExtract,
            SSHPrepare,
            SSHRunner,
            SSHUpload
        }
    },
    util : { Logger }
} = require('../../../../');

describe('SSHRunner', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('execute', function () {
        it('should return a promise', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            const FakeRunner = this[ 'sencha-deploy' ].createObservable({
                add () {},
                begin : sandbox.stub().resolves({ success : true })
            });

            sandbox.stub(FakeRunner.prototype, 'add').callsFake(function () {
                return this;
            });

            mock.expects('log').once();

            const SSHRunner = proxyquire(
                '../../../../lib/step/ssh/SSHRunner',
                {
                    '../../' : {
                        util : {
                            Logger,
                            Runner : FakeRunner
                        }
                    }
                }
            );

            instance = new SSHRunner();

            const promise = instance.execute({
                info : {}
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch((error) => {
                    console.log(error);
                    expect(false).to.be.true;
                });
        });

        it('should resolve on runner success', function () {
            const { sandbox } = this;
            const begin_stub = sandbox.stub().resolves({ success : true });
            const mock       = sandbox.mock(Logger);
            const FakeRunner = this[ 'sencha-deploy' ].createObservable({
                add () {},
                begin : begin_stub
            });

            const add_stub = sandbox.stub(FakeRunner.prototype, 'add').callsFake(function () {
                return this;
            });

            mock.expects('log').once();

            const SSHRunner = proxyquire(
                '../../../../lib/step/ssh/SSHRunner',
                {
                    '../../' : {
                        util : {
                            Logger,
                            Runner : FakeRunner
                        }
                    }
                }
            );

            instance = new SSHRunner();

            const promise = instance.execute({
                info : {
                    app       : 'foo',
                    args      : 'bar',
                    file      : 'baz',
                    moduleCfg : 'foobar'
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(add_stub).to.have.calledOnce;
                    expect(add_stub.getCall(0).args).to.have.lengthOf(3);

                    expect(begin_stub).to.have.calledWithExactly({
                        app       : 'foo',
                        args      : 'bar',
                        file      : 'baz',
                        moduleCfg : 'foobar'
                    });

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should reject on runner failure', function () {
            const { sandbox } = this;
            const begin_stub = sandbox.stub().rejects(new Error('foo'));
            const mock       = sandbox.mock(Logger);
            const FakeRunner = this[ 'sencha-deploy' ].createObservable({
                add () {},
                begin : begin_stub
            });

            const add_stub = sandbox.stub(FakeRunner.prototype, 'add').callsFake(function () {
                return this;
            });

            mock.expects('log').once();

            const SSHRunner = proxyquire(
                '../../../../lib/step/ssh/SSHRunner',
                {
                    '../../' : {
                        util : {
                            Logger,
                            Runner : FakeRunner
                        }
                    }
                }
            );

            instance = new SSHRunner();

            const promise = instance.execute({
                info : {
                    app       : 'foo',
                    args      : 'bar',
                    file      : 'baz',
                    moduleCfg : 'foobar'
                }
            });

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');

                    expect(add_stub).to.have.calledOnce;
                    expect(add_stub.getCall(0).args).to.have.lengthOf(3);

                    expect(begin_stub).to.have.calledWithExactly({
                        app       : 'foo',
                        args      : 'bar',
                        file      : 'baz',
                        moduleCfg : 'foobar'
                    });

                    mock.verify();
                });
        });
    });

    describe('prepare', function () {
        it('should return instance of SSHPrepare', function () {
            instance = new SSHRunner();

            const prepare = instance.prepare();

            expect(prepare).to.be.instanceOf(SSHPrepare);

            expect(prepare.config).to.be.an('object');
            expect(prepare.config).to.be.empty;
        });

        it('should pass config from runner to prepare instance', function () {
            instance = new SSHRunner({
                foo : 'bar'
            });

            const prepare = instance.prepare();

            expect(prepare).to.be.instanceOf(SSHPrepare);
            //expect(prepare).to.have.deep.property('config.foo', 'bar');
            expect(prepare.config).to.have.property('foo', 'bar');
        });

        it('should pass config from method to prepare instance', function () {
            instance = new SSHRunner();

            const prepare = instance.prepare({
                foo : 'bar'
            });

            expect(prepare).to.be.instanceOf(SSHPrepare);
            //expect(prepare).to.have.deep.property('config.foo', 'bar');
            expect(prepare.config).to.have.property('foo', 'bar');
        });
    });

    describe('upload', function () {
        it('should return instance of SSHUpload', function () {
            instance = new SSHRunner();

            const upload = instance.upload();

            expect(upload).to.be.instanceOf(SSHUpload);

            expect(upload.config).to.be.an('object');
            expect(upload.config).to.be.empty;
        });

        it('should pass config from runner to upload instance', function () {
            instance = new SSHRunner({
                foo : 'bar'
            });

            const upload = instance.upload();

            expect(upload).to.be.instanceOf(SSHUpload);
            //expect(upload).to.have.deep.property('config.foo', 'bar');
            expect(upload.config).to.have.property('foo', 'bar');
        });

        it('should pass config from method to upload instance', function () {
            instance = new SSHRunner();

            const upload = instance.upload({
                foo : 'bar'
            });

            expect(upload).to.be.instanceOf(SSHUpload);
            //expect(upload).to.have.deep.property('config.foo', 'bar');
            expect(upload.config).to.have.property('foo', 'bar');
        });
    });

    describe('extract', function () {
        it('should return instance of SSHExtract', function () {
            instance = new SSHRunner();

            const extract = instance.extract();

            expect(extract).to.be.instanceOf(SSHExtract);

            expect(extract.config).to.be.an('object');
            expect(extract.config).to.be.empty;
        });

        it('should pass config from runner to extract instance', function () {
            instance = new SSHRunner({
                foo : 'bar'
            });

            const extract = instance.extract();

            expect(extract).to.be.instanceOf(SSHExtract);
            //expect(extract).to.have.deep.property('config.foo', 'bar');
            expect(extract.config).to.have.property('foo', 'bar');
        });

        it('should pass config from method to extract instance', function () {
            instance = new SSHRunner();

            const extract = instance.extract({
                foo : 'bar'
            });

            expect(extract).to.be.instanceOf(SSHExtract);
            //expect(extract).to.have.deep.property('config.foo', 'bar');
            expect(extract.config).to.have.property('foo', 'bar');
        });
    });
});
