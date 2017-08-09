const { expect } = require('chai');

const {
    module : { Base },
    util   :  { Logger }
} = require('../../../');

describe('Base Module', function () {
    it('instantiate', function () {
        const module = new Base('foo');

        expect(module.config).to.eql('foo');
    });

    describe('logInfo', function () {
        it('should log file being deployed', function () {
            const instance = new Base();
            const mock     = this.sandbox.mock(Logger);

            mock.expects('log').twice();

            instance.logInfo({
                args    : {
                    name : 'name',
                    path : 'path'
                },
                product : {}
            });

            mock.verify();
        });

        it('should use product name from product', function () {
            const instance = new Base();
            const mock     = this.sandbox.mock(Logger);

            mock.expects('log').twice();

            instance.logInfo({
                args    : {
                    path    : 'path',
                    version : '1'
                },
                product : {
                    name : 'name'
                }
            });

            mock.verify();
        });
    });

    describe('mergeModuleConfig', function () {
        it('should merge known module', function () {
            const info     = {};
            const instance = new Base({
                modules : {
                    foo : {
                        bar : 'baz'
                    }
                }
            });

            instance.mergeModuleConfig('foo', info);

            //expect(info).to.have.deep.property('moduleCfg.bar', 'baz');
            expect(info.moduleCfg).to.have.property('bar', 'baz');
        });

        it('should not merge unknown module', function () {
            const info     = {};
            const instance = new Base({
                modules : {
                    foo : {
                        bar : 'baz'
                    }
                }
            });

            instance.mergeModuleConfig('bar', info);

            expect(info).to.have.property('moduleCfg');
            expect(info.moduleCfg).to.be.empty;
        });
    });
});
