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

        if (!provider || !provider.destroyed) {
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
            const Action = this[ 'sencha-direct' ].createResolveAction('foo');

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

            return api
                .then(ret => {
                    expect(ret).to.have.property('data', 'window.REMOTING_API={"type":"remoting","actions":{"FooAction":[{"name":"bar"}]}};');
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('router', function () {
        it('should handle success', function () {
            const spy = this.sandbox.spy(function (ret) {
                expect(ret).to.contain.all.keys([ 'action', 'method', 'tid', 'type', 'data' ]);

                expect(ret.data).to.have.deep.property('success', true);
                expect(ret.data).to.have.deep.property('msg',     'hello');
            });

            this[ 'sencha-direct' ].createManagerResolve();

            return instance
                .router(this[ 'sencha-direct' ].createMockReq(), this[ 'sencha-direct' ].createMockRes())
                .then(spy, spy);
        });

        it('should handle failure', function () {
            const spy = this.sandbox.spy(function (ret) {
                expect(ret).to.contain.all.keys([ 'action', 'method', 'tid', 'type', 'data' ]);

                expect(ret.data).to.have.deep.property('success', false);
                expect(ret.data).to.have.deep.property('msg',     'something happened');
            });

            this[ 'sencha-direct' ].createManagerReject();

            return instance
                .router(this[ 'sencha-direct' ].createMockReq(), this[ 'sencha-direct' ].createMockRes())
                .then(null, spy);
        });
    });
});
