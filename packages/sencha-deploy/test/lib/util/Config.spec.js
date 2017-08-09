const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

const { util : { Config, Logger } } = require('../../../');

const _config = {
    defaults : {
        foo  : 'bar',
        foo2 : 'bar2'
    },
    testEnv : {
        foo2 : '2bar',
        foo3 : 'bar3'
    }
};

const _config2 = {
    defaults : {},
    testEnv  : {
        foo4 : 'bar4',
        foo5 : 'bar5'
    }
};

const _env = {
    NODE_ENV : 'testEnv'
};

describe('Config', () => {
    afterEach(() => {
        Config.config = null;
    });

    describe('load', () => {
        it('loads default config for specific env', () => {
            const env = sinon.stub(process, 'env').value(_env);

            const config = proxyquire(
                '../../../lib/util/Config',
                {
                    fs : {
                        readFileSync () {
                            return JSON.stringify(_config);
                        }
                    }
                }
            );

            const res = config.load();

            expect(res).to.have.property('foo',  'bar');
            expect(res).to.have.property('foo2', '2bar');
            expect(res).to.have.property('foo3', 'bar3');

            env.restore();
        });

        it('loads json config if provided as param', () => {
            const env = sinon.stub(process, 'env').value(_env);

            const config = proxyquire(
                '../../../lib/util/Config',
                {
                    fs : {
                        readFileSync () {
                            return JSON.stringify(_config);
                        }
                    }
                }
            );

            const res = config.load({
                config : JSON.stringify(_config2)
            });

            expect(res).to.have.property('foo4', 'bar4');
            expect(res).to.have.property('foo5', 'bar5');

            env.restore();
        });

        it('loads config from file if provided as param', () => {
            const env = sinon.stub(process, 'env').value(_env);

            const exitStub = sinon.stub(process, 'exit');

            const config = proxyquire(
                '../../../lib/util/Config',
                {
                    fs : {
                        readFileSync  () {
                            return JSON.stringify(_config);
                        }
                    }
                }
            );

            config.load({
                path : '../../config.json'
            });

            expect(exitStub).not.to.be.called;

            env.restore();
            exitStub.restore();
        });

        it('throws an error if unable to read config', () => {
            const env = sinon.stub(process, 'env').value(_env);

            const exitStub = sinon.stub(process, 'exit');

            const mock   = sinon.mock(Logger);
            const config = proxyquire(
                '../../../lib/util/Config',
                {
                    fs : {
                        readFileSync : sinon.stub().throws(new Error('file not found'))
                    }
                }
            );

            mock.expects('log').once();

            config.load({
                path : '../../config1.json'
            });

            expect(exitStub).to.be.called;

            env.restore();
            exitStub.restore();

            mock.verify();
        });

        it('should default to development env', () => {
            const config = proxyquire(
                '../../../lib/util/Config',
                {
                    fs : {
                        readFileSync () {
                            return JSON.stringify({
                                defaults : {
                                    foo  : 'bar',
                                    foo2 : 'bar2'
                                },
                                development : {
                                    foo2 : '2bar',
                                    foo3 : 'bar3'
                                }
                            });
                        }
                    }
                }
            );

            const res = config.load();

            expect(res).to.have.property('foo',  'bar');
            expect(res).to.have.property('foo2', '2bar');
            expect(res).to.have.property('foo3', 'bar3');
        });

        it('should load file when a string is passed', () => {
            const config = proxyquire(
                '../../../lib/util/Config',
                {
                    fs : {
                        readFileSync () {
                            return JSON.stringify({
                                defaults : {
                                    foo  : 'bar',
                                    foo2 : 'bar2'
                                },
                                development : {
                                    foo2 : '2bar',
                                    foo3 : 'bar3'
                                }
                            });
                        }
                    }
                }
            );

            const res = config.load('config.json');

            expect(res).to.have.property('foo',  'bar');
            expect(res).to.have.property('foo2', '2bar');
            expect(res).to.have.property('foo3', 'bar3');
        });

        it('should load path', () => {
            const config = proxyquire(
                '../../../lib/util/Config',
                {
                    fs : {
                        readFileSync () {
                            return JSON.stringify({
                                defaults : {
                                    foo  : 'bar',
                                    foo2 : 'bar2'
                                },
                                development : {
                                    foo2 : '2bar',
                                    foo3 : 'bar3'
                                }
                            });
                        }
                    }
                }
            );

            const res = config.load({
                path : 'config.json'
            });

            expect(res).to.have.property('foo',  'bar');
            expect(res).to.have.property('foo2', '2bar');
            expect(res).to.have.property('foo3', 'bar3');
        });

        it('should allow object with configs', () => {
            const res = Config.load({
                defaults : {
                    foo  : 'bar',
                    foo2 : 'bar2'
                },
                development : {
                    foo2 : '2bar',
                    foo3 : 'bar3'
                }
            });

            expect(res).to.have.property('foo',  'bar');
            expect(res).to.have.property('foo2', '2bar');
            expect(res).to.have.property('foo3', 'bar3');
        });
    });

    describe('get', () => {
        it('should find a config', () => {
            Config.config = {
                foo : 'bar'
            };

            const value = Config.get('foo');

            expect(value).to.equal('bar');
        });

        it('should not find a config', () => {
            Config.config = {
                foo : 'bar'
            };

            const value = Config.get('foobar');

            expect(value).to.be.undefined;
        });

        it('should return whole config', () => {
            Config.config = {
                foo : 'bar'
            };

            const value = Config.get();

            expect(value).to.have.property('foo', 'bar');
        });
    });
});
