const { expect } = require('chai');

const Action   = require('./../../Action');
const Manager  = require('./../../Manager');
const Provider = require('./../../Provider');

describe('Sencha.direct.Manager', function () {
    let provider;

    afterEach(function () {
        Manager.remove(provider);

        Manager.apiVariable =
            provider =
            null;
    });

    describe('instantiation', function () {
        it('should be a singleton', function () {
            expect(Manager.isInstance).to.be.true;
        });

        it('should set apiVariable', function () {
            Manager.apiVariable = 'window.REMOTING_API';

            expect(Manager).to.have.property('apiVariable', 'window.REMOTING_API');
        });
    });

    describe('add', function () {
        it('should add provider from instance', function () {
            provider = new Provider();

            Manager.add('remoting', provider);

            expect(Manager.__$instances).to.be.a('map');
            expect(Manager.__$instances.size).to.equal(1);
            expect(Manager.__$instances.get('remoting')).to.equal(provider);
        });

        it('should add provider from config', function () {
            Manager.add('polling', {});

            expect(Manager.__$instances.size).to.equal(1);
            expect(Manager.__$instances.get('polling')).to.be.instanceof(Provider);

            //cleanup
            provider = Manager.__$instances.get('polling');

            expect(provider).to.be.instanceof(Provider);
        });

        it('should throw for unknown type', function () {
            const fn = () => {
                Manager.add('foo', {});
            };

            expect(fn).to.throw(Error, 'The direct type ("foo") is not recognized.');
        });
    });

    describe('remove', function () {
        beforeEach(function () {
            provider = new Provider();
        });

        it('should remove instance', function () {
            Manager.add('remoting', provider);

            expect(Manager.__$instances.size).to.equal(1);

            Manager.remove(provider);

            expect(Manager.__$instances.size).to.equal(0);
        });

        it('should remove instance by name', function () {
            Manager.add('polling', provider);

            expect(Manager.__$instances.size).to.equal(1);

            Manager.remove('polling');

            expect(Manager.__$instances.size).to.equal(0);
        });
    });

    describe('findAction', function () {
        beforeEach(function () {
            Manager.add(
                'remoting',
                provider = new Provider({
                    actions : {
                        FooAction : {
                            bar : {}
                        }
                    }
                })
            );
        });

        it('should find action', function () {
            const action = Manager.findAction('FooAction', 'bar');

            expect(action).to.be.instanceof(Action);
        });

        it('should not find action with wrong name', function () {
            const action = Manager.findAction('BarAction', 'bar');

            expect(action).to.be.undefined;
        });

        it('should not find action with wrong method name', function () {
            const action = Manager.findAction('FooAction', 'baz');

            expect(action).to.be.undefined;
        });
    });

    describe('dispatch', function () {
        it('should return a promise', function () {
            const ret = Manager.dispatch({});

            expect(ret).to.be.a('promise');

            ret.catch(() => {});
        });

        it('should still fire event if no actions are found', function () {
            const spy = this.sandbox.spy(event => {
                expect(event).to.have.property('type', 'directaction');
                expect(event.action).to.be.undefined;
                expect(event.args).to.be.undefined;
                expect(event.extra).to.be.undefined;

                expect(event.params).to.be.an('object');
                expect(event.params).to.be.empty;

                event.resolve('foo');
            });

            Manager.on({
                single       : true,
                scope        : Manager,
                directaction : spy
            });

            return Manager.dispatch({});
        });

        it('should resolve promise on event listening', function () {
            const spy = this.sandbox.spy(function (ret) {
                expect(ret).to.be.a('string');
                expect(ret).to.equal('foo');
            });

            const Action = this.createResolveAction('foo');

            Manager.add(
                'remoting',
                {
                    actions : {
                        FooAction : {
                            bar : new Action({
                                name : 'bar'
                            })
                        }
                    }
                }
            );

            Manager.on({
                single       : true,
                scope        : Manager,
                directaction : function (event) {
                    event.resolve('foo');
                }
            });

            return Manager
                .dispatch({
                    action : 'FooAction',
                    method : 'bar'
                })
                .then(spy, spy);
        });

        it('should reject promise on event listening', function () {
            const spy = this.sandbox.spy(function (error) {
                expect(error).to.be.instanceof(Error);
                expect(error.message).to.equal('bad');
            });

            const Action = this.createResolveAction('foo');

            Manager.add(
                'remoting',
                {
                    actions : {
                        FooAction : {
                            bar : new Action({
                                name : 'bar'
                            })
                        }
                    }
                }
            );

            Manager.on({
                single       : true,
                scope        : Manager,
                directaction : function (event) {
                    event.reject(new Error('bad'));
                }
            });

            return Manager
                .dispatch({
                    action : 'FooAction',
                    method : 'bar'
                })
                .then(spy, spy);
        });

        it('should resolve action', function () {
            const spy = this.sandbox.spy(function (ret) {
                expect(ret).to.be.a('string');
                expect(ret).to.equal('foo');
            });

            const Action = this.createResolveAction('foo');

            Manager.add(
                'polling',
                {
                    actions : {
                        FooAction : {
                            bar : new Action({
                                name : 'bar'
                            })
                        }
                    }
                }
            );

            return Manager
                .dispatch({
                    action : 'FooAction',
                    method : 'bar'
                })
                .then(spy, spy);
        });

        it('should resolve with mixed event listening and handlers', function () {
            const spy = this.sandbox.spy(function (ret) {
                expect(ret).to.be.a('array');
                expect(ret).to.have.length(3);
                expect(ret).to.include('foo');
                expect(ret).to.include('bar');
                expect(ret).to.include('baz');
            });

            const Action = this.createResolveAction([ 'foo', 'bar' ]);

            Manager.add(
                'polling',
                {
                    actions : {
                        FooAction : {
                            bar : new Action({
                                name : 'bar'
                            })
                        }
                    }
                }
            );

            Manager.on({
                single       : true,
                scope        : Manager,
                directaction : function (event) {
                    event.resolve('baz');
                }
            });

            return Manager
                .dispatch({
                    action : 'FooAction',
                    method : 'bar'
                })
                .then(spy, spy);
        });
    });

    describe('api', function () {
        describe('one provider', function () {
            it('should serialize api with one action', function () {
                Manager.add(
                    'remoting',
                    {
                        actions : {
                            FooAction : {
                                bar : {}
                            }
                        }
                    }
                );

                const { api } = Manager;

                expect(api).to.be.an('object');
                expect(api).to.have.property('type', 'remoting');

                expect(api).to.have.property('actions');
                expect(api.actions).to.be.an('object');

                expect(api).to.have.deep.property('actions.FooAction');
                expect(api.actions.FooAction).to.be.an('array');
                expect(api.actions.FooAction).to.have.lengthOf(1);

                expect(api).to.have.deep.property('actions.FooAction[0].name', 'bar');

                Manager.apiVariable = 'window.REMOTING_API';

                const { api: str } = Manager;

                expect(str).to.equal('window.REMOTING_API={"type":"remoting","actions":{"FooAction":[{"name":"bar"}]}};');
            });

            it('should serialize api with complex action', function () {
                Manager.add(
                    'polling',
                    {
                        actions : {
                            BarAction : {
                                doBar : {}
                            },
                            FooAction : {
                                doFoo      : {},
                                doFooAgain : {}
                            }
                        }
                    }
                );

                const { api } = Manager;

                expect(api).to.be.an('object');
                expect(api).to.have.property('type', 'polling');

                expect(api).to.have.property('actions');
                expect(api.actions).to.be.an('object');

                expect(api).to.have.deep.property('actions.BarAction');
                expect(api.actions.BarAction).to.be.an('array');
                expect(api.actions.BarAction).to.have.lengthOf(1);

                expect(api).to.have.deep.property('actions.FooAction');
                expect(api.actions.FooAction).to.be.an('array');
                expect(api.actions.FooAction).to.have.lengthOf(2);

                expect(api).to.have.deep.property('actions.BarAction[0].name', 'doBar');
                expect(api).to.have.deep.property('actions.FooAction[0].name', 'doFoo');
                expect(api).to.have.deep.property('actions.FooAction[1].name', 'doFooAgain');

                Manager.apiVariable = 'window.REMOTING_API';

                const { api: str } = Manager;

                expect(str).to.equal('window.REMOTING_API={"type":"polling","actions":{"BarAction":[{"name":"doBar"}],"FooAction":[{"name":"doFoo"},{"name":"doFooAgain"}]}};');
            });
        });

        describe('multiple providers', function () {
            it('should serialize api with complex action', function () {
                Manager.add(
                    'remoting',
                    {
                        actions : {
                            BarAction : {
                                doBar : {}
                            }
                        }
                    }
                );

                Manager.add(
                    'polling',
                    {
                        actions : {
                            FooAction : {
                                doFoo      : {},
                                doFooAgain : {}
                            }
                        }
                    }
                );

                const { api } = Manager;

                expect(api).to.be.an('array');
                expect(api).to.have.lengthOf(2);

                expect(api).to.have.deep.property('[0].type', 'remoting');
                expect(api).to.have.deep.property('[0].actions');
                expect(api[0].actions).to.be.an('object');
                expect(api).to.have.deep.property('[0].actions.BarAction');
                expect(api[0].actions.BarAction).to.be.an('array');
                expect(api[0].actions.BarAction).to.have.lengthOf(1);
                expect(api).to.have.deep.property('[0].actions.BarAction[0].name', 'doBar');

                expect(api).to.have.deep.property('[1].type', 'polling');
                expect(api).to.have.deep.property('[1].actions');
                expect(api[1].actions).to.be.an('object');
                expect(api).to.have.deep.property('[1].actions.FooAction');
                expect(api[1].actions.FooAction).to.be.an('array');
                expect(api[1].actions.FooAction).to.have.lengthOf(2);
                expect(api).to.have.deep.property('[1].actions.FooAction[0].name', 'doFoo');
                expect(api).to.have.deep.property('[1].actions.FooAction[1].name', 'doFooAgain');

                Manager.apiVariable = 'window.REMOTING_API';

                const { api: str } = Manager;

                expect(str).to.equal('window.REMOTING_API=[{"type":"remoting","actions":{"BarAction":[{"name":"doBar"}]}},{"type":"polling","actions":{"FooAction":[{"name":"doFoo"},{"name":"doFooAgain"}]}}];');
            });
        });
    });

    describe('set providers', function () {
        describe('add', function () {
            it('should add a provider', function () {
                Manager.providers = {
                    remoting : {
                        actions : {
                            FooAction : {
                                doFoo : {}
                            }
                        }
                    }
                };

                const { api } = Manager;

                expect(api).to.be.an('object');

                expect(api).to.have.deep.property('type', 'remoting');
                expect(api).to.have.deep.property('actions');
                expect(api.actions).to.be.an('object');
                expect(api).to.have.deep.property('actions.FooAction');
                expect(api.actions.FooAction).to.be.an('array');
                expect(api.actions.FooAction).to.have.lengthOf(1);
                expect(api).to.have.deep.property('actions.FooAction[0].name', 'doFoo');

                Manager.apiVariable = 'window.REMOTING_API';

                const { api: str } = Manager;

                expect(str).to.equal('window.REMOTING_API={"type":"remoting","actions":{"FooAction":[{"name":"doFoo"}]}};');
            });


            it('should add many provider', function () {
                Manager.providers = {
                    polling  : {
                        maxRetires : 0,
                        actions    : {
                            BarAction : {
                                doBar      : {},
                                doBarAgain : {}
                            }
                        }
                    },
                    remoting : {
                        actions : {
                            FooAction : {
                                doFoo : {}
                            }
                        }
                    }
                };

                const { api } = Manager;

                expect(api).to.be.an('array');
                expect(api).to.have.lengthOf(2);

                expect(api).to.have.deep.property('[0].type', 'polling');
                expect(api).to.have.deep.property('[0].actions');
                expect(api[0].actions).to.be.an('object');
                expect(api).to.have.deep.property('[0].actions.BarAction');
                expect(api[0].actions.BarAction).to.be.an('array');
                expect(api[0].actions.BarAction).to.have.lengthOf(2);
                expect(api).to.have.deep.property('[0].actions.BarAction[0].name', 'doBar');
                expect(api).to.have.deep.property('[0].actions.BarAction[1].name', 'doBarAgain');

                expect(api).to.have.deep.property('[1].type', 'remoting');
                expect(api).to.have.deep.property('[1].actions');
                expect(api[1].actions).to.be.an('object');
                expect(api).to.have.deep.property('[1].actions.FooAction');
                expect(api[1].actions.FooAction).to.be.an('array');
                expect(api[1].actions.FooAction).to.have.lengthOf(1);
                expect(api).to.have.deep.property('[1].actions.FooAction[0].name', 'doFoo');

                Manager.apiVariable = 'window.REMOTING_API';

                const { api: str } = Manager;

                expect(str).to.equal('window.REMOTING_API=[{"type":"polling","actions":{"BarAction":[{"name":"doBar"},{"name":"doBarAgain"}]}},{"type":"remoting","actions":{"FooAction":[{"name":"doFoo"}]}}];');
            });
        });

        describe('remove', function () {
            it('should remove providers', function () {
                Manager.providers = {
                    remoting : {
                        actions : {
                            FooAction : {
                                doFoo : {}
                            }
                        }
                    }
                };

                expect(Manager.api).to.be.an('object');

                Manager.providers = null;

                const { api } = Manager;

                expect(api).to.be.an('array');
                expect(api).to.be.empty;

                Manager.apiVariable = 'window.REMOTING_API';

                const { api: str } = Manager;

                expect(str).to.equal('window.REMOTING_API=[];');
            });
        });
    });

    describe('finishDispatch', function () {
        it('should flatten result', function () {
            const result = [ 'foo', 'bar' ];
            const ret    = Manager.finishDispatch(result);

            expect(ret).to.be.an('array');
            expect(ret).to.have.lengthOf(2);
            expect(ret).to.include('foo');
            expect(ret).to.include('bar');
        });

        it('should return item if only one result', function () {
            const result = [ 'foo' ];
            const ret    = Manager.finishDispatch(result);

            expect(ret).to.be.equal('foo');
        });
    });

    describe('flatten', function () {
        it('should flatten a single argument', function () {
            const args = [
                [ 'foo', 'bar' ]
            ];

            const ret = Manager.flatten(...args);

            expect(ret).to.be.an('array');
            expect(ret).to.have.lengthOf(2);
            expect(ret).to.include('foo');
            expect(ret).to.include('bar');
        });

        it('should flatten multiple arguments', function () {
            const args = [
                [ 'foo', 'bar' ],
                [ 'baz', 'foo' ]
            ];

            const ret = Manager.flatten(...args);

            expect(ret).to.be.an('array');
            expect(ret).to.have.lengthOf(3);
            expect(ret).to.include('foo');
            expect(ret).to.include('bar');
            expect(ret).to.include('baz');
        });

        it('should not flatten if no arguments are passed', function () {
            const ret = Manager.flatten();

            expect(ret).to.be.an('array');
            expect(ret).to.be.empty;
        });

        it('should ignore null/undefined arguments', function () {
            const args = [
                [ 'foo', 'bar' ],
                null,
                undefined,
                [ 'baz', 'foo' ]
            ];

            const ret = Manager.flatten(...args);

            expect(ret).to.be.an('array');
            expect(ret).to.have.lengthOf(3);
            expect(ret).to.include('foo');
            expect(ret).to.include('bar');
            expect(ret).to.include('baz');
        });

        it('should handle non-array arguments', function () {
            const args = [
                [ 'foo', 'bar' ],
                null,
                'baz',
                'foo'
            ];

            const ret = Manager.flatten(...args);

            expect(ret).to.be.an('array');
            expect(ret).to.have.lengthOf(3);
            expect(ret).to.include('foo');
            expect(ret).to.include('bar');
            expect(ret).to.include('baz');
        });

        it('should ignore empty array arguments', function () {
            const args = [
                [ 'foo', 'bar' ],
                null,
                undefined,
                [],
                'baz',
                'foo'
            ];

            const ret = Manager.flatten(...args);

            expect(ret).to.be.an('array');
            expect(ret).to.have.lengthOf(3);
            expect(ret).to.include('foo');
            expect(ret).to.include('bar');
            expect(ret).to.include('baz');
        });
    });
});
