const argv       = require('argv');
const { expect } = require('chai');
const pkg        = require('../../../package.json');
const sinon      = require('sinon');

const { util : { Args } } = require('../../../');

const modules = {
    release : './module/Release.js'
};

describe('Args', () => {
    let args;

    beforeEach(() => {
        sinon.stub(process, 'argv').value([]);
    });

    afterEach(() => {
        args = null;
    });

    it('init module with proper params', () => {
        const initArgvStub = sinon.stub(argv, 'mod').callsFake(() => {
            //
        });

        const stub = sinon.stub(argv, 'run').callsFake(() => {
            return {
                mod     : 'release',
                options : {
                    config : JSON.stringify({
                        foo : 'bar'
                    }),
                    cpath    : './config.json',
                    license  : 'commercial',
                    platform : 'Windows X64',
                    product  : 'ext',
                    version  : '1.2.1'
                },
                targets : [
                    './test.txt'
                ]
            };
        });

        args = new Args(modules);

        expect(initArgvStub.args[ 0 ][ 0 ]).to.have.property('mod', 'release');
        expect(initArgvStub.args[ 0 ][ 0 ]).to.have.property('options');
        expect(args.modules).to.eql(modules);

        stub.restore();
    });

    it('return config options if specified', () => {
        const stub = sinon.stub(argv, 'run').callsFake(() => {
            return {
                mod     : 'release',
                options : {
                    config : JSON.stringify({
                        foo : 'bar'
                    }),
                    cpath    : './config.json',
                    license  : 'commercial',
                    platform : 'Windows X64',
                    product  : 'ext',
                    version  : '1.2.1'
                },
                targets : [
                    './test.txt'
                ]
            };
        });

        args = new Args(modules);

        const co = args.config;

        expect(co).to.eql({
            config : JSON.stringify({
                foo : 'bar'
            }),
            path : './config.json'
        });

        stub.restore();
    });

    it('return arguments', () => {
        args = new Args(modules);

        expect(args.arguments).to.eql(args._arguments);
    });

    it('return module', () => {
        const stub = sinon.stub(argv, 'run').callsFake(() => {
            return {
                mod     : 'release',
                options : {
                    config : JSON.stringify({
                        foo : 'bar'
                    }),
                    cpath    : './config.json',
                    license  : 'commercial',
                    platform : 'Windows X64',
                    product  : 'ext',
                    version  : '1.2.1'
                },
                targets : [
                    './test.txt'
                ]
            };
        });

        args = new Args(modules);

        const promise = args.getArguments();

        expect(promise).to.be.a('promise');

        stub.restore();

        return promise
            .then(() => {
                expect(args.module).to.equal('release');
            })
            .catch(() => {
                expect(false).to.be.true;
            });
    });

    it('path through validation if everything is fine', () => {
        args = new Args({
            release : './module/Release.js'
        });

        args.mode       = 'release';
        args._arguments = {
            path : './foo'
        };

        expect(args._validate.bind(args)).not.to.throw(Error);
    });

    it('return error if module is not defined', () => {
        args = new Args({});

        args.mode = null;

        expect(args._validate.bind(args)).to.throw(Error);
    });

    it('return error if module is not supported', () => {
        args = new Args({
            release : './module/Release.js'
        });

        args.mode = 'something-not-supported';

        expect(args._validate.bind(args)).to.throw(Error);
    });

    it('return error if unable o parse arguments', () => {
        args = new Args({});

        args._arguments = null;

        expect(args._validate.bind(args)).to.throw(Error);
    });

    it('return error if path is not defined', () => {
        args = new Args({});

        args._arguments = {};

        expect(args._validate.bind(args)).to.throw(Error);
    });

    it('should print out version', () => {
        const mock = sinon.mock(console);

        mock
            .expects('log')
            .once()
            .withExactArgs(`${pkg.version}\n`);

        args = new Args({});

        const exitStub = sinon.stub(process, 'exit');

        argv.run([
            '--version'
        ]);

        exitStub.restore();

        mock.verify();
    });

    describe('getArguments', () => {
        it('should parse existing params', () => {
            args = new Args(modules);

            args._arguments = {};

            const promise = args.getArguments();

            return promise
                .then(res => {
                    expect(res).to.be.empty;
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should parse params', () => {
            const stub = sinon.stub(argv, 'run').callsFake(() => {
                return {
                    mod     : 'release',
                    options : {
                        config : JSON.stringify({
                            foo : 'bar'
                        }),
                        cpath    : './config.json',
                        license  : 'commercial',
                        platform : 'Windows X64',
                        product  : 'ext',
                        version  : '1.2.1'
                    },
                    targets : [
                        './test.txt'
                    ]
                };
            });

            args = new Args(modules);

            const promise = args.getArguments();

            stub.restore();

            return promise
                .then(args => {
                    expect(args).to.have.property('path');
                    expect(args).to.have.property('version', '1.2.1');
                    expect(args).to.have.property('platform', 'Windows X64');
                    expect(args).to.have.property('product', 'ext');
                    expect(args).to.have.property('license', 'commercial');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should throw an error when no targets exist', () => {
            const stub = sinon.stub(argv, 'run').callsFake(() => {
                return {
                    mod     : 'release',
                    options : {
                        config : JSON.stringify({
                            foo : 'bar'
                        }),
                        cpath    : './config.json',
                        license  : 'commercial',
                        platform : 'Windows X64',
                        product  : 'ext',
                        version  : '1.2.1'
                    },
                    targets : []
                };
            });

            args = new Args(modules);

            const promise = args.getArguments();

            stub.restore();

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('Path to file is not defined.');
                });
        });
    });

    describe('config', () => {
        it('should return empty config', () => {
            args = new Args(modules);

            const { config } = args;

            expect(config).to.be.null;
        });

        it('should pass config when config was passed', () => {
            args = new Args(modules);

            args._a.options = {
                config : 'foo'
            };

            const { config } = args;

            expect(config).to.have.property('config', 'foo');
            expect(config).to.have.property('path',   null);
        });

        it('should pass config when cpath was passed', () => {
            args = new Args(modules);

            args._a.options = {
                cpath : 'foo'
            };

            const { config } = args;

            expect(config).to.have.property('config', null);
            expect(config).to.have.property('path',  'foo');
        });

        it('should pass config when config and cpath were passed', () => {
            args = new Args(modules);

            args._a.options = {
                config : 'foo',
                cpath  : 'bar'
            };

            const { config } = args;

            expect(config).to.have.property('config', 'foo');
            expect(config).to.have.property('path',   'bar');
        });
    });

    describe('getArgument', () => {
        it('should return an argument', () => {
            args = new Args();

            args._arguments = {
                foo : 'bar'
            };

            const arg = args.getArgument('foo');

            expect(arg).to.equal('bar');
        });

        it('should not return an argument', () => {
            args = new Args();

            args._arguments = {
                foo : 'bar'
            };

            const arg = args.getArgument('baz');

            expect(arg).to.be.undefined;
        });

        it('should not return an argument if no key passed in', () => {
            args = new Args();

            args._arguments = {
                foo : 'bar'
            };

            const arg = args.getArgument();

            expect(arg).to.be.undefined;
        });
    });

    describe('_validate', () => {
        it('should throw an error if no mode', () => {
            args = new Args(modules);

            const fn = () => {
                args._validate();
            };

            expect(fn).to.throw(Error, 'Can not call script without specifying a module.');
        });

        it('should throw an error if unknown module', () => {
            args = new Args(modules);

            args.mode = 'foo';

            const fn = () => {
                args._validate();
            };

            expect(fn).to.throw(Error, 'Module "foo" is not supported.');
        });

        it('should throw an error if no arguments', () => {
            args = new Args(modules);

            args.mode    = 'foo';
            args.modules = {
                foo : true
            };

            const fn = () => {
                args._validate();
            };

            expect(fn).to.throw(Error, 'Can not call script without any arguments.');
        });

        it('should throw an error if no path', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {};

            const fn = () => {
                args._validate();
            };

            expect(fn).to.throw(Error, 'Path to file is not defined.');
        });

        it('should cast cdn to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                cdn  : 'true',
                path : 'foo'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.cdn', true);
            expect(args._arguments).to.have.property('cdn', true);
        });

        it('should not cast cdn to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                cdn  : '/foo/bar',
                path : 'foo'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.cdn', '/foo/bar');
            expect(args._arguments).to.have.property('cdn', '/foo/bar');
        });

        it('should not set cdn', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path : 'foo'
            };

            args._validate();

            // expect(args).to.not.have.deep.property('_arguments.cdn');
            expect(args._arguments).to.not.have.property('cdn');
        });

        it('should cast cdn-extract to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                'cdn-extract' : 'true',
                path          : 'foo'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.cdn-extract', true);
            expect(args._arguments).to.have.property('cdn-extract', true);
        });

        it('should not cast cdn-extract to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                'cdn-extract' : '/foo/bar',
                path          : 'foo'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.cdn-extract', '/foo/bar');
            expect(args._arguments).to.have.property('cdn-extract', '/foo/bar');
        });

        it('should not set cdn-extract', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path : 'foo'
            };

            args._validate();

            // expect(args).to.not.have.deep.property('_arguments.cdn-extract');
            expect(args._arguments).to.not.have.property('cdn-extract');
        });

        it('should cast qa to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path : 'foo',
                qa   : 'true'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.qa', true);
            expect(args._arguments).to.have.property('qa', true);
        });

        it('should not cast qa to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path : 'foo',
                qa   : '/foo/bar'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.qa', '/foo/bar');
            expect(args._arguments).to.have.property('qa', '/foo/bar');
        });

        it('should not set qa', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path : 'foo'
            };

            args._validate();

            // expect(args).to.not.have.deep.property('_arguments.qa');
            expect(args._arguments).to.not.have.property('qa');
        });

        it('should cast qa-extract to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path         : 'foo',
                'qa-extract' : 'true'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.qa-extract', true);
            expect(args._arguments).to.have.property('qa-extract', true);
        });

        it('should not cast qa-extract to boolean', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path         : 'foo',
                'qa-extract' : '/foo/bar'
            };

            args._validate();

            // expect(args).to.have.deep.property('_arguments.qa-extract', '/foo/bar');
            expect(args._arguments).to.have.property('qa-extract', '/foo/bar');
        });

        it('should not set qa-extract', () => {
            args = new Args(modules);

            args.mode       = 'foo';
            args.modules    = {
                foo : true
            };
            args._arguments = {
                path : 'foo'
            };

            args._validate();

            // expect(args).to.not.have.deep.property('_arguments.qa-extract');
            expect(args._arguments).to.not.have.property('qa-extract');
        });
    });
});
