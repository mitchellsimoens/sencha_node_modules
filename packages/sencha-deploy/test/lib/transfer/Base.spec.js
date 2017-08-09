const { expect } = require('chai');
const proxyquire = require('proxyquire');

const Base = proxyquire('../../../lib/transfer/Base', {
    fs   : {
        readFileSync (key) {
            return 'buffer ' + key;
        }
    },
    path : {
        resolve (...args) {
            return 'resolved ' + args.pop();
        }
    }
});

describe('Base Transfer', function () {
    let instance;

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        it('should handle passing no config', function () {
            instance = new Base();

            expect(instance.config).to.be.an('object');
        });

        it('should set config', function () {
            instance = new Base({
                foo : 'bar'
            });

            //expect(instance).to.have.deep.property('config.foo', 'bar');
            expect(instance.config).to.have.property('foo', 'bar');
        });
    });

    describe('parseKey', function () {
        it('should parse key into a buffer', function () {
            instance = new Base({
                key : 'bar'
            });

            //expect(instance).to.have.deep.property('config.key', 'buffer bar');
            expect(instance.config).to.have.property('key', 'buffer bar');
        });

        it('should resolve & parse key for development', function () {
            this.sandbox.stub(process, 'env').value({
                NODE_ENV : 'development'
            });

            instance = new Base({
                key : 'bar'
            });

            //expect(instance).to.have.deep.property('config.key', 'buffer resolved bar');
            expect(instance.config).to.have.property('key', 'buffer resolved bar');
        });

        it('should not parse key if a buffer', function () {
            const key = Buffer.from('bar');

            instance = new Base({
                key : key
            });

            //expect(instance).to.have.deep.property('config.key', key);
            expect(instance.config).to.have.property('key', key);
        });
    });
});
