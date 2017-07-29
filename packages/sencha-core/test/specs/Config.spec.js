const { expect } = require('chai');
const { Config } = require('../../');
const proxyquire = require('proxyquire');

describe('Sencha.core.Config', function () {
    afterEach(function () {
        delete Config.configs;
    });

    describe('instantiation', function () {
        it('should be a config', function () {
            expect(Config).to.have.property('isConfig', true);
        });

        it('should be an instance', function () {
            expect(Config).to.have.property('isInstance', true);
        });
    });

    describe('env', function () {
        afterEach(function () {
            Config.env = 'development'
        });

        it('should be development', function () {
            expect(Config).to.have.property('env', 'development');

            expect(Config).to.have.property('isDev', true);
        });

        it('should set production', function () {
            Config.env = 'production';

            expect(Config).to.have.property('env', 'production');

            expect(Config).to.have.property('isProduction', true);
        });

        it('should set testing', function () {
            Config.env = 'testing';

            expect(Config).to.have.property('env', 'testing');

            expect(Config).to.have.property('isTest', true);
        });
    });

    describe('read', function () {
        it('should read from object', function (done) {
            const spy = this.sandbox.spy();

            Config
                .read({
                    default : {
                        foo  : 'bar'
                    },
                    development : {
                        bar : 'baz'
                    }
                })
                .then(
                    Config => {
                        expect(Config).to.have.deep.property('configs.foo', 'bar');
                        expect(Config).to.have.deep.property('configs.bar', 'baz');
                    },
                    spy
                );

            setTimeout(() => {
                expect(spy).to.not.have.been.called;

                done();
            }, 15);
        });

        it('should read from json file', function (done) {
            const spy = this.sandbox.spy();

            Config
                .read(__dirname)
                .then(
                    Config => {
                        expect(Config).to.have.deep.property('configs.foo', 'dev');
                        expect(Config).to.have.deep.property('configs.bar', 'dev bar');
                    },
                    spy
                );

            setTimeout(() => {
                expect(spy).to.not.have.been.called;

                done();
            }, 15);
        });

        it('should read from appRoot', function (done) {
            Config.appRoot = __dirname;

            const spy = this.sandbox.spy();

            Config
                .read()
                .then(
                    Config => {
                        expect(Config).to.have.deep.property('configs.foo', 'dev');
                        expect(Config).to.have.deep.property('configs.bar', 'dev bar');
                    },
                    spy
                );

            Config.appRoot = null;

            setTimeout(() => {
                expect(spy).to.not.have.been.called;

                done();
            }, 15);
        });

        it('should not read if no dir is passed', function () {
            return Config
                .read()
                .then(
                    () => {
                        // shouldn't get called, trigger failure
                        expect(false).to.be.true;
                    }
                )
                .catch(error => {
                    expect(error.message).to.equal('Nothing to read from.');
                });
        });

        it('should not read if dir is not readable', function () {
            return Config
                .read(true)
                .then(
                    () => {
                        // shouldn't get called, trigger failure
                        expect(false).to.be.true;
                    }
                )
                .catch(error => {
                    expect(error.message).to.equal('Nothing to read from.');
                });
        });
    });

    describe('get', function () {
        it('should get with simple accessor', function (done) {
            const spy = this.sandbox.spy();

            Config
                    .read(__dirname)
                    .then(
                        () => {
                            const value = Config.get('foo');

                            expect(value).to.be.equal('dev');
                        },
                        spy
                    );

            setTimeout(() => {
                expect(spy).to.not.have.been.called;

                done();
            }, 15);
        });

        it('should get with object accessor', function (done) {
            const spy = this.sandbox.spy();

            Config
                    .read(__dirname)
                    .then(
                        () => {
                            const value = Config.get('obj.nested');

                            expect(value).to.be.equal(2);
                        },
                        spy
                    );

            setTimeout(() => {
                expect(spy).to.not.have.been.called;

                done();
            }, 15);
        });
    });

    describe('set', function () {
        it('should set with simple accessor and no configs read in', function () {
            Config.set('foo', 'bar');

            const value = Config.get('foo');

            expect(value).to.be.equal('bar');
        });

        it('should set with object accessor and no configs read in', function () {
            Config.set('foo.bar', 'baz');

            let value = Config.get('foo');

            expect(value).to.be.a('object');

            value = Config.get('foo.bar');

            expect(value).to.be.equal('baz');
        });

        it('should set with simple accessor', function () {
            Config.read({
                default : {
                    foo  : 'bar'
                },
                development : {
                    bar : 'baz'
                }
            });

            Config.set('foo', 'baz');
            Config.set('bar', 'foo');

            let value = Config.get('foo');

            expect(value).to.be.equal('baz');

            value = Config.get('bar');

            expect(value).to.be.equal('foo');
        });

        it('should set with object accessor', function () {
            Config.read({
                default : {
                    obj  : {
                        nested : 1
                    }
                },
                development : {
                    obj : {
                        nested : 2
                    }
                }
            });

            Config.set('obj.nested', 3);

            let value = Config.get('obj');

            expect(value).to.be.a('object');

            value = Config.get('obj.nested');

            expect(value).to.be.equal(3);
        });
    });

    describe('readObj', function () {
        it('should return a promise', function () {
            const promise = Config.readObj({});

            expect(promise).to.be.a('promise');
        });

        it('should read object', function () {
            const promise = Config.readObj({
                development : {
                    foo : 'bar'
                }
            });

            return promise
                .then(config => {
                    expect(config).to.be.an('object');
                    expect(config).to.have.property('foo', 'bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should read object with default only', function () {
            const promise = Config.readObj({
                'default' : {
                    foo : 'bar'
                }
            });

            return promise
                .then(config => {
                    expect(config).to.be.an('object');
                    expect(config).to.have.property('foo', 'bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should merge env and default objects together', function () {
            const promise = Config.readObj({
                'default'   : {
                    foo : 'bar'
                },
                development : {
                    foo : 'baz',
                    bar : 'foobar'
                }
            });

            return promise
                .then(config => {
                    expect(config).to.be.an('object');
                    expect(config).to.have.property('foo', 'baz');
                    expect(config).to.have.property('bar', 'foobar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should set object onto a key', function () {
            const config  = {};
            const promise = Config.readObj({
                development : {
                    foo : 'bar'
                }
            }, config, 'mykey');

            return promise
                .then(config => {
                    expect(config).to.be.an('object');
                    expect(config).to.have.deep.property('mykey.foo', 'bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should overwrite key', function () {
            const config  = {
                mykey : 'should be replaced'
            };
            const promise = Config.readObj({
                development : {
                    foo : 'bar'
                }
            }, config, 'mykey');

            return promise
                .then(config => {
                    expect(config).to.be.an('object');
                    expect(config).to.have.deep.property('mykey.foo', 'bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('readDir', function () {
        it('should handle read dir error', function () {
            const readdir = this.sandbox.stub().callsArgWith(1, new Error('dir not found'));
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );

            return Config
                .readDir('/foo/bar')
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(readdir).to.have.been.calledWith('/foo/bar');

                    expect(error.message).to.equal('dir not found');
                });
        });

        it('should read default.json in the dir', function () {
            const files   = [ 'default.json' ];
            const readdir = this.sandbox.stub().callsArgWith(1, null, files);
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );
            const readFile = this.sandbox.stub(Config, 'readFile').resolves({
                foo : 'bar'
            });

            return Config
                .readDir('/foo/bar')
                .then(ret => {
                    expect(ret).to.be.an('object');
                    expect(ret).to.have.property('foo', 'bar');

                    expect(readFile).to.have.been.calledTwice;

                    expect(readFile.firstCall) .to.have.been.calledWith('default.json', '/foo/bar');
                    expect(readFile.secondCall).to.have.been.calledWith(undefined,      '/foo/bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should read development.json in the dir', function () {
            const files   = [ 'development.json' ];
            const readdir = this.sandbox.stub().callsArgWith(1, null, files);
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );
            const readFile = this.sandbox.stub(Config, 'readFile').resolves({
                foo : 'bar'
            });

            return Config
                .readDir('/foo/bar')
                .then(ret => {
                    expect(ret).to.be.an('object');
                    expect(ret).to.have.property('foo', 'bar');

                    expect(readFile).to.have.been.calledTwice;

                    expect(readFile.firstCall) .to.have.been.calledWith(undefined,          '/foo/bar');
                    expect(readFile.secondCall).to.have.been.calledWith('development.json', '/foo/bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should read default.json and development.json in the dir', function () {
            const files   = [ 'default.json', 'development.json' ];
            const readdir = this.sandbox.stub().callsArgWith(1, null, files);
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );
            const readFile = this.sandbox.stub(Config, 'readFile');

            readFile.onFirstCall().resolves({
                foo : 'bar'
            });

            readFile.onSecondCall().resolves({
                foo : 'baz',
                bar : 'foobar'
            });

            return Config
                .readDir('/foo/bar')
                .then(ret => {
                    expect(ret).to.be.an('object');
                    expect(ret).to.have.property('foo', 'baz');
                    expect(ret).to.have.property('bar', 'foobar');

                    expect(readFile).to.have.been.calledTwice;

                    expect(readFile.firstCall) .to.have.been.calledWith('default.json',     '/foo/bar');
                    expect(readFile.secondCall).to.have.been.calledWith('development.json', '/foo/bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle no default.json and no env json but with another env json', function () {
            const files   = [ 'production.json' ];
            const readdir = this.sandbox.stub().callsArgWith(1, null, files);
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );
            const readFile = this.sandbox.stub(Config, 'readFile').resolves();

            return Config
                .readDir('/foo/bar')
                .then(ret => {
                    expect(ret).to.be.an('object');
                    expect(ret).to.be.empty;

                    expect(readFile).to.have.been.calledTwice;

                    expect(readFile.firstCall) .to.have.been.calledWith(undefined, '/foo/bar');
                    expect(readFile.secondCall).to.have.been.calledWith(undefined, '/foo/bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle no default.json and no env json and no other env json', function () {
            const files   = [ 'foobar.json' ];
            const readdir = this.sandbox.stub().callsArgWith(1, null, files);
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );
            const readFile = this.sandbox.stub(Config, 'readFile').resolves();

            return Config
                .readDir('/foo/bar')
                .then(ret => {
                    expect(ret).to.be.an('object');
                    expect(ret).to.be.empty;

                    expect(readFile).to.have.been.calledTwice;

                    expect(readFile.firstCall) .to.have.been.calledWith(undefined, '/foo/bar');
                    expect(readFile.secondCall).to.have.been.calledWith(undefined, '/foo/bar');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should read child directories', function () {
            const files   = [ 'baz' ];
            const readdir = this.sandbox.stub().callsArgWith(1, null, files);
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );
            const readFile = this.sandbox.stub(Config, 'readFile').resolves({
                foo : 'bar'
            });

            const promise = Config.readDir('/foo/bar');

            const childReadDir = this.sandbox.stub(Config, 'readDir').resolves({
                foo : 'bar'
            });

            return promise
                .then(ret => {
                    expect(ret).to.be.an('array');
                    expect(ret).to.have.lengthOf(1);
                    expect(ret).to.have.deep.property('[0].foo', 'bar');

                    expect(readFile).to.have.been.calledTwice;

                    expect(readFile.firstCall) .to.have.been.calledWith(undefined, '/foo/bar');
                    expect(readFile.secondCall).to.have.been.calledWith(undefined, '/foo/bar');

                    expect(childReadDir).to.have.been.calledOnce;
                    expect(childReadDir).to.have.been.calledWith('/foo/bar/baz');
                })
                .catch((e) => {
                    console.log(e);
                    expect(false).to.be.true;
                });
        });

        it('should read child directories with a key', function () {
            const files   = [ 'baz' ];
            const readdir = this.sandbox.stub().callsArgWith(1, null, files);
            const Config  = proxyquire(
                '../../Config',
                {
                    fs : {
                        readdir
                    }
                }
            );
            const readFile = this.sandbox.stub(Config, 'readFile').resolves({
                foo : 'bar'
            });

            const promise = Config.readDir('/foo/bar', undefined, 'mykey');

            const childReadDir = this.sandbox.stub(Config, 'readDir').resolves({
                foo : 'bar'
            });

            return promise
                .then(ret => {
                    expect(ret).to.be.an('array');
                    expect(ret).to.have.lengthOf(1);
                    expect(ret).to.have.deep.property('[0].foo', 'bar');

                    expect(readFile).to.have.been.calledTwice;

                    expect(readFile.firstCall) .to.have.been.calledWith(undefined, '/foo/bar');
                    expect(readFile.secondCall).to.have.been.calledWith(undefined, '/foo/bar');

                    expect(childReadDir).to.have.been.calledOnce;
                    expect(childReadDir).to.have.been.calledWith('/foo/bar/baz');
                })
                .catch((e) => {
                    console.log(e);
                    expect(false).to.be.true;
                });
        });
    });

    describe('readFile', function () {
        it('should return a promise', function () {
            const promise = Config.readFile();

            expect(promise).to.be.a('promise');

            return promise
                .then(ret => {
                    expect(ret).to.be.undefined;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should read file', function () {
            const readFile = this.sandbox.stub().callsArgWith(2, null, '{}');
            const Config   = proxyquire(
                '../../Config',
                {
                    fs : {
                        readFile
                    }
                }
            );

            return Config
                .readFile('/foo/bar')
                .then(ret => {
                    expect(readFile).to.have.been.calledWith(
                        '/foo/bar',
                        { encoding : 'utf8' }
                    );

                    expect(ret).to.be.an('object');
                    expect(ret).to.be.empty;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle a read file error', function () {
            const readFile = this.sandbox.stub().callsArgWith(2, new Error('file not found'));
            const Config   = proxyquire(
                '../../Config',
                {
                    fs : {
                        readFile
                    }
                }
            );

            return Config
                .readFile('/foo/bar')
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(readFile).to.have.been.calledWith(
                        '/foo/bar',
                        { encoding : 'utf8' }
                    );

                    expect(error.message).to.equal('file not found');
                });
        });

        it('should handle malformed json', function () {
            const readFile = this.sandbox.stub().callsArgWith(2, null, '{"foo": "bar}');
            const Config   = proxyquire(
                '../../Config',
                {
                    fs : {
                        readFile
                    }
                }
            );

            return Config
                .readFile('/foo/bar')
                .then(ret => {
                    expect(readFile).to.have.been.calledWith(
                        '/foo/bar',
                        { encoding : 'utf8' }
                    );

                    expect(ret).to.be.undefined;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should read a file with a root', function () {
            const readFile = this.sandbox.stub().callsArgWith(2, null, '{}');
            const Config   = proxyquire(
                '../../Config',
                {
                    fs : {
                        readFile
                    }
                }
            );

            return Config
                .readFile('bar', '/foo')
                .then(ret => {
                    expect(readFile).to.have.been.calledWith(
                        '/foo/bar',
                        { encoding : 'utf8' }
                    );

                    expect(ret).to.be.an('object');
                    expect(ret).to.be.empty;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('get', function () {
        it('should return object', function () {
            const result = Config.get();

            expect(result).to.equal(Config.configs)
        });

        it('should return with shallow key', function () {
            Config.set('foo', 'bar');

            const result = Config.get('foo');

            expect(result).to.equal('bar');
        });

        it('should return with nested key', function () {
            Config.set('foo.nested', 'bar');

            const result = Config.get('foo.nested');

            expect(result).to.equal('bar');
        });

        it('should return nested object', function () {
            Config.set('foo.nested', 'bar');

            const result = Config.get('foo');

            expect(result).to.be.an('object');
            expect(result).to.equal(Config.configs.foo);
        });

        it('should handle unknown key path', function () {
            Config.set('foo.nested', 'bar');

            const result = Config.get('foo.nested.bar');

            expect(result).to.be.undefined;
        });
    });

    describe('set', function () {
        it('should set a simple config', function () {
            Config.set('foo', 'bar');

            expect(Config).to.have.deep.property('configs.foo', 'bar');
        });

        it('should set a nested config', function () {
            Config.set('foo.nested', 'bar');

            expect(Config.configs.foo).to.be.an('object');
            expect(Config).to.have.deep.property('configs.foo.nested', 'bar');
        });

        it('should merge objects', function () {
            Config.set('foo.nested', 'bar');

            expect(Config.configs.foo).to.be.an('object');
            expect(Config).to.have.deep.property('configs.foo.nested', 'bar');

            Config.set('foo.nested2', 'baz');

            expect(Config.configs.foo).to.be.an('object');
            expect(Config).to.have.deep.property('configs.foo.nested', 'bar');
            expect(Config).to.have.deep.property('configs.foo.nested2', 'baz');
        });
    });
});
