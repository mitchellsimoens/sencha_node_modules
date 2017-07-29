const { expect } = require('chai');

const Action   = require('./../../Action');
const Provider = require('./../../Provider');

describe('Sencha.direct.Provider', function () {
    let provider;

    afterEach(function () {
        if (provider) {
            provider.destroy();
            provider = null;
        }
    });

    describe('instantiation', function () {
        it('should be a provider', function () {
            provider = new Provider();

            expect(provider).to.have.property('isDirectProvider', true);
        });

        it('should set bufferLimit', function () {
            provider = new Provider({
                bufferLimit : 4
            });

            expect(provider).to.have.property('bufferLimit', 4);
        });

        it('should set enableBuffer to number', function () {
            provider = new Provider({
                enableBuffer : 500
            });

            expect(provider).to.have.property('enableBuffer', 500);
        });

        it('should set enableBuffer to boolean', function () {
            provider = new Provider({
                enableBuffer : false
            });

            expect(provider).to.have.property('enableBuffer', false);
        });

        it('should set enableUrlEncode', function () {
            provider = new Provider({
                enableUrlEncode : 'rootData'
            });

            expect(provider).to.have.property('enableUrlEncode', 'rootData');
        });

        it('should set id', function () {
            provider = new Provider({
                id : 'my-provider'
            });

            expect(provider).to.have.property('id', 'my-provider');
        });

        it('should set maxRetries', function () {
            provider = new Provider({
                maxRetries : 0
            });

            expect(provider).to.have.property('maxRetries', 0);
        });

        it('should set namespace', function () {
            provider = new Provider({
                namespace : 'Sencha'
            });

            expect(provider).to.have.property('namespace', 'Sencha');
        });

        it('should set timeout', function () {
            provider = new Provider({
                timeout : 45000
            });

            expect(provider).to.have.property('timeout', 45000);
        });

        it('should set type to default', function () {
            provider = new Provider({});

            expect(provider).to.have.property('type', 'remoting');
        });

        it('should set type', function () {
            provider = new Provider({
                type : 'polling'
            });

            expect(provider).to.have.property('type', 'polling');
        });

        it('should set url', function () {
            provider = new Provider({
                url : '//foo.com/router'
            });

            expect(provider).to.have.property('url', '//foo.com/router');
        });
    });

    describe('serialize', function () {
        it('should serialize', function () {
            provider = new Provider();

            expect(provider.serialize).to.be.a('object');
        });

        it('should serialize with bufferLimit', function () {
            provider = new Provider({
                bufferLimit : 4
            });

            expect(provider.serialize).to.have.property('bufferLimit', 4);
        });

        it('should serialize with enableBuffer to number', function () {
            provider = new Provider({
                enableBuffer : 500
            });

            expect(provider.serialize).to.have.property('enableBuffer', 500);
        });

        it('should serialize with enableBuffer to boolean', function () {
            provider = new Provider({
                enableBuffer : false
            });

            expect(provider.serialize).to.have.property('enableBuffer', false);
        });

        it('should serialize with enableUrlEncode', function () {
            provider = new Provider({
                enableUrlEncode : 'rootData'
            });

            expect(provider.serialize).to.have.property('enableUrlEncode', 'rootData');
        });

        it('should serialize with id', function () {
            provider = new Provider({
                id : 'my-provider'
            });

            expect(provider.serialize).to.have.property('id', 'my-provider');
        });

        it('should serialize with maxRetries', function () {
            provider = new Provider({
                maxRetries : 0
            });

            expect(provider.serialize).to.have.property('maxRetries', 0);
        });

        it('should serialize with namespace', function () {
            provider = new Provider({
                namespace : 'Sencha'
            });

            expect(provider.serialize).to.have.property('namespace', 'Sencha');
        });

        it('should serialize with timeout', function () {
            provider = new Provider({
                timeout : 45000
            });

            expect(provider.serialize).to.have.property('timeout', 45000);
        });

        it('should serialize with type to default', function () {
            provider = new Provider({});

            expect(provider.serialize).to.have.property('type', 'remoting');
        });

        it('should serialize with type', function () {
            provider = new Provider({
                type : 'polling'
            });

            expect(provider.serialize).to.have.property('type', 'polling');
        });

        it('should serialize with url', function () {
            provider = new Provider({
                url : '//foo.com/router'
            });

            expect(provider.serialize).to.have.property('url', '//foo.com/router');
        });

        it('should serialize with no actions', function () {
            provider = new Provider({
                actions : {
                    FooAction : {}
                }
            });

            const { serialize } = provider;

            expect(serialize).to.be.an('object');

            expect(serialize).to.have.property('type', 'remoting');
            expect(serialize.actions).to.be.an('object');
            expect(serialize.actions).to.be.empty;
        });

        it('should serialize with an action', function () {
            provider = new Provider({
                actions : {
                    FooAction : {
                        bar : {}
                    }
                }
            });

            const { serialize } = provider;

            expect(serialize).to.be.an('object');

            expect(serialize).to.have.property('type', 'remoting');
            expect(serialize.actions).to.be.an('object');

            expect(serialize).to.have.deep.property('actions.FooAction');
            expect(serialize.actions.FooAction).to.be.an('array');
            expect(serialize.actions.FooAction).to.have.lengthOf(1);

            expect(serialize.actions.FooAction[0]).to.be.an('object');
            expect(serialize).to.have.deep.property('actions.FooAction[0].name', 'bar');
        });
    });

    describe('actions', function () {
        beforeEach(function () {
            provider = new Provider();
        });

        it('should add actions', function () {
            provider.actions = {
                FooAction : [
                    {}
                ]
            };

            expect(provider.get().size).to.equal(1);
            expect(provider.get('FooAction')).to.be.an('array');
        });

        it('should not add actions', function () {
            provider.actions = [
                {}
            ];

            expect(provider.get().size).to.equal(0);
        });

        it('should not add null actions', function () {
            provider.actions = null;

            expect(provider.get().size).to.equal(0);
        });
    });

    describe('add', function () {
        beforeEach(function () {
            provider = new Provider();
        });

        it('should add action from instance', function () {
            const action = new Action();

            provider.add(
                'FooAction',
                action
            );

            expect(provider.get('FooAction')).to.be.an('array');
            expect(provider.get('FooAction')).to.have.length(1);
            expect(provider.get('FooAction')[0]).to.be.instanceof(Action);
        });

        it('should add action from config', function () {
            provider.add(
                'FooAction',
                {}
            );

            expect(provider.get('FooAction')).to.be.an('array');
            expect(provider.get('FooAction')).to.have.length(1);
            expect(provider.get('FooAction')[0]).to.be.instanceof(Action);
        });

        it('should add action from object set to instance', function () {
            const action = new Action();

            provider.add(
                'FooAction',
                action
            );

            expect(provider.get('FooAction')).to.be.an('array');
            expect(provider.get('FooAction')).to.have.length(1);
            expect(provider.get('FooAction')[0]).to.be.instanceof(Action);
        });

        it('should add action from object set to config', function () {
            provider.add(
                'FooAction',
                {}
            );

            expect(provider.get('FooAction')).to.be.an('array');
            expect(provider.get('FooAction')).to.have.length(1);
            expect(provider.get('FooAction')[0]).to.be.instanceof(Action);
        });

        it('should add action from object set to array of instance', function () {
            const action = new Action();

            provider.add(
                {
                    FooAction : [
                        action
                    ]
                }
            );

            expect(provider.get('FooAction')).to.be.an('array');
            expect(provider.get('FooAction')).to.have.length(1);
            expect(provider.get('FooAction')[0]).to.be.instanceof(Action);
        });

        it('should add action from object set to array of config', function () {
            provider.add(
                {
                    FooAction : [
                        {}
                    ]
                }
            );

            expect(provider.get('FooAction')).to.be.an('array');
            expect(provider.get('FooAction')).to.have.length(1);
            expect(provider.get('FooAction')[0]).to.be.instanceof(Action);
        });
    });

    describe('findAction', function () {
        beforeEach(function () {
            provider = new Provider({
                actions : {
                    FooAction : {
                        bar : {}
                    }
                }
            });
        });

        it('should find action', function () {
            const action = provider.findAction('FooAction', 'bar');

            expect(action).to.be.instanceof(Action);
        });

        it('should not find action with wrong name', function () {
            const action = provider.findAction('BarAction', 'bar');

            expect(action).to.be.undefined;
        });

        it('should not find action with wrong method name', function () {
            const action = provider.findAction('FooAction', 'baz');

            expect(action).to.be.undefined;
        });
    });

    describe('get actions', function () {
        it('should get all actions', function () {
            provider = new Provider({
                actions : {
                    FooAction : {
                        bar : {}
                    }
                }
            });

            const { actions } = provider;

            expect(actions).to.be.a('map');
            expect(actions.size).to.equal(1);
            expect(actions).to.equal(provider.get());
        });
    });
});
