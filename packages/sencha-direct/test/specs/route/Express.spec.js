const { expect } = require('chai');

const { Manager, Provider, route : { Express } } = require('./../../../');

describe('Sencha.direct.route.Express', function () {
    let instance, provider;

    beforeEach(function () {
        instance = new Express();
    });

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }

        if (provider) {
            Manager.remove(provider);
        }
    });

    describe('instantiation', function () {
        it('should be a direct express route', function () {
            expect(instance).to.have.property('isDirectExpressRoute', true);
        });

        it('should have the direct route mixin', function () {
            expect(instance).to.have.property('isDirectRoute', true);
        });

        it('should an express route', function () {
            expect(instance).to.have.property('isExpressRoute', true);
        });
    });

    describe('api', function () {
        it('should return a promise', function () {
            const api = instance.api();

            expect(api).to.be.a('promise');
        });

        it('should use apiVariable', function () {
            const Action = this.createResolveAction('foo');

            Manager.add(
                'remoting',
                provider = new Provider({
                    actions : {
                        FooAction : {
                            bar : new Action({
                                name : 'bar'
                            })
                        }
                    }
                })
            );

            instance.apiVariable = 'window.REMOTING_API';

            const api = instance.api();

            expect(api).to.eventually.have.property('data', 'window.REMOTING_API={"type":"remoting","actions":{"FooAction":[{"name":"bar"}]}};');

            return api;
        });
    });

    describe('router', function () {
        it('should handle success', function () {
            const spy = this.sandbox.spy(function (ret) {
                expect(ret).to.contain.all.keys([ 'action', 'method', 'tid', 'type', 'data' ]);

                expect(ret).to.have.deep.property('data.success', true);
                expect(ret).to.have.deep.property('data.msg',     'hello');
            });

            this.createManagerResolve();

            return instance
                .router(this.createMockReq(), this.createMockRes())
                .then(spy, spy);
        });

        it('should handle failure', function () {
            const spy = this.sandbox.spy(function (ret) {
                expect(ret).to.contain.all.keys([ 'action', 'method', 'tid', 'type', 'data' ]);

                expect(ret).to.have.deep.property('data.success', false);
                expect(ret).to.have.deep.property('data.msg',     'something happened');
            });

            this.createManagerReject();

            return instance
                .router(this.createMockReq(), this.createMockRes())
                .then(null, spy);
        });
    });
});
