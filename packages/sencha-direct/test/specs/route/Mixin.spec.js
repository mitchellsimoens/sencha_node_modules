const { expect } = require('chai');

const { Base, Config } = require('@extjs/sencha-core');

const Mixin = require('../../../route/Mixin');

describe('Sencha.direct.route.Mixin', function () {
    let instance;

    beforeEach(function () {
        class Foo extends Base {
            static get meta () {
                return {
                    mixins : [
                        Mixin
                    ]
                };
            }
        }

        instance = new Foo();
    });

    afterEach(function () {
        if (instance) {
            instance.destroy();
            instance = null;
        }
    });

    describe('getInfo', function () {
        it('should get upload info', function () {
            const info = instance.getInfo({
                extAction : 'FooAction',
                extMethod : 'doSomething',
                extTID    : 1,
                extType   : 'remoting',
                extUpload : true
            });

            expect(info).to.have.property('isUpload', true);
            expect(info).to.have.property('isForm',   true);
            expect(info).to.have.property('action',   'FooAction');
            expect(info).to.have.property('method',   'doSomething');
            expect(info).to.have.property('tid',      1);
            expect(info).to.have.property('type',     'remoting');

            expect(info.data).to.have.deep.property('extAction', 'FooAction');
            expect(info.data).to.have.deep.property('extMethod', 'doSomething');
            expect(info.data).to.have.deep.property('extTID',    1);
            expect(info.data).to.have.deep.property('extType',   'remoting');
            expect(info.data).to.have.deep.property('extUpload', true);
        });

        it('should get info', function () {
            const info = instance.getInfo({
                action : 'FooAction',
                method : 'doSomething',
                tid    : 1,
                type   : 'rpc',
                data   : [ 'foo' ]
            });

            expect(info).to.have.property('action', 'FooAction');
            expect(info).to.have.property('method', 'doSomething');
            expect(info).to.have.property('tid',    1);
            expect(info).to.have.property('type',   'rpc');

            expect(info).to.have.property('data');
            expect(info.data).to.be.an('array');
            expect(info.data).to.have.lengthOf(1);
            //expect(info.data).to.have.deep.property('[0]', 'foo');
            expect(info.data[0]).to.equal('foo');
        });

        it('should parse data as a string into JSON', function () {
            const info = instance.getInfo({
                action : 'FooAction',
                method : 'doSomething',
                tid    : 1,
                type   : 'rpc',
                data   : '["foo"]'
            });

            expect(info).to.have.property('action', 'FooAction');
            expect(info).to.have.property('method', 'doSomething');
            expect(info).to.have.property('tid',    1);
            expect(info).to.have.property('type',   'rpc');

            expect(info).to.have.property('data');
            expect(info.data).to.be.an('array');
            expect(info.data).to.have.lengthOf(1);
            //expect(info.data).to.have.deep.property('[0]', 'foo');
            expect(info.data[0]).to.equal('foo');
        });

        it('should handle malformed data json', function () {
            const info = instance.getInfo({
                action : 'FooAction',
                method : 'doSomething',
                tid    : 1,
                type   : 'rpc',
                data   : '["foo]'
            });

            expect(info).to.have.property('action', 'FooAction');
            expect(info).to.have.property('method', 'doSomething');
            expect(info).to.have.property('tid',    1);
            expect(info).to.have.property('type',   'rpc');
            expect(info).to.have.property('data',   '["foo]');
        });
    });

    describe('createResolver', function () {
        it('should handle an error', function () {
            const spy      = this.sandbox.spy(ret => {
                expect(ret).to.be.an('object');

                expect(ret).to.have.property('action', 'FooAction');
                expect(ret).to.have.property('method', 'doSomething');
                expect(ret).to.have.property('tid',    1);
                expect(ret).to.have.property('type',   'remoting');

                expect(ret.data).to.be.an('object');

                expect(ret.data).to.have.deep.property('success', false);
                expect(ret.data).to.have.deep.property('msg',     'foo bar');
                expect(ret.data.stack).to.be.an('array');
                expect(ret.data.stack).to.have.length.above(2);
            });
            const info     = {
                action : 'FooAction',
                method : 'doSomething',
                tid    : 1,
                type   : 'remoting',
                data   : {}
            };
            const resolver = instance.createResolver(info, spy);
            const error    = new Error('foo bar');

            resolver(error);

            expect(spy).to.have.been.called;
        });

        it('should not have error stack in prod', function () {
            const spy      = this.sandbox.spy(ret => {
                expect(ret).to.be.an('object');

                expect(ret).to.have.property('action', 'FooAction');
                expect(ret).to.have.property('method', 'doSomething');
                expect(ret).to.have.property('tid',    1);
                expect(ret).to.have.property('type',   'remoting');

                expect(ret.data).to.be.an('object');

                expect(ret.data).to.have.deep.property('success', false);
                expect(ret.data).to.have.deep.property('msg',     'foo bar');
                expect(ret.data.stack).to.be.undefined;
            });
            const info     = {
                action : 'FooAction',
                method : 'doSomething',
                tid    : 1,
                type   : 'remoting',
                data   : {}
            };
            const resolver = instance.createResolver(info, spy);
            const error    = new Error('foo bar');
            const oldEnv   = Config.env;

            Config.env = 'production';

            resolver(error);

            Config.env = oldEnv;

            expect(spy).to.have.been.called;
        });
    });
});
