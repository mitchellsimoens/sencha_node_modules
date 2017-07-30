const { expect } = require('chai');
const proxyquire = require('proxyquire');

const { Base : CoreBase } = require('@extjs/sencha-core');

const Adapter = require('../../Adapter');

describe('Adapter', function () {
    let instance;

    afterEach(function () {
        if (instance) {
            instance.destroy();

            instance = null;
        }
    });

    describe('initialization', function () {
        it('should be mysql token adapter', function () {
            instance = new Adapter();

            expect(instance).to.be.have.property('isTokenMySQLAdapter', true);
        });

        it('should have a rootPath', function () {
            instance = new Adapter({
                rootPath : 'foo'
            });

            expect(instance).to.be.have.property('rootPath', 'foo');
        });
    });

    describe('operations', function () {
        it('should have api token operations', function () {
            instance = new Adapter();

            expect(instance.operations).to.have.property('api.token.create', null);
            expect(instance.operations).to.have.property('api.token.delete', null);
            expect(instance.operations).to.have.property('api.token.get',    null);
        });

        /*it('should not be able to set operations', function () {
            instance = new Adapter();

            const fn = () => {
                instance.operations = {};
            };

            expect(fn).to.throw(Error, /^cannot set property operations/i);
        });*/
    });

    describe('instantiateOperation', function () {
        it('should have db config', function () {
            const { sandbox } = this;
            const spy         = sandbox.stub();
            const Adapter     = proxyquire('../../Adapter', {
                '@extjs/sencha-core' : {
                    operation : {
                        Adapter : class Adapter extends CoreBase {
                            instantiateOperation (operation, config) {
                                return spy.call(this, operation, config);
                            }
                        }
                    }
                }
            });

            instance = new Adapter({
                db : 'foo'
            });

            instance.instantiateOperation(null, {});

            expect(spy).to.have.been.calledOnce;

            spy.should.have.been.calledWithExactly(null, {
                db : 'foo'
            });
        });
    });
});
