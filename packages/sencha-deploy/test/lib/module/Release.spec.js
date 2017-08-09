const { expect } = require('chai');
const proxyquire = require('proxyquire');

const { util : { Logger } } = require('../../../');

describe('Release Module', function () {
    it('instantiate', function () {
        const Module = proxyquire(
            '../../../lib/module/Release',
            {
                '../util/Logger' : {},
                '../storage'     : {}
            }
        );

        const module = new Module('foo');

        expect(module.config).to.equal('foo');
    });

    describe('run', function () {
        it('should run all steps', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const Release     = proxyquire(
                '../../../lib/module/Release',
                {
                    '../' : {
                        step : {
                            CDN                   : sandbox.stub().returns({
                                name    : 'CDN',
                                execute : () => {}
                            }),
                            CheckProductExistence : sandbox.stub().returns({
                                name    : 'CheckProductExistence',
                                execute : () => {}
                            }),
                            CheckUpdate           : sandbox.stub().returns({
                                name    : 'CheckUpdate',
                                execute : () => {}
                            }),
                            GetProduct            : sandbox.stub().returns({
                                name    : 'GetProduct',
                                execute : () => {}
                            }),
                            HashFile              : sandbox.stub().returns({
                                name    : 'HashFile',
                                execute : () => {}
                            }),
                            SaveToDatabase        : sandbox.stub().returns({
                                name    : 'SaveToDatabase',
                                execute : () => {}
                            }),
                            SaveToStorage         : sandbox.stub().returns({
                                name    : 'SaveToStorage',
                                execute : () => {}
                            }),
                            ValidateArguments     : sandbox.stub().returns({
                                name    : 'ValidateArguments',
                                execute : () => {}
                            })
                        }
                    }
                }
            );
            const instance = new Release({
                modules : {}
            });

            mock.expects('log').exactly(22);

            const promise = instance.run({
                args : {
                    name : 'name',
                    path : 'path'
                }
            });

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle error in step', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const undo_stub   = sandbox.stub();
            const Release     = proxyquire(
                '../../../lib/module/Release',
                {
                    '../' : {
                        step : {
                            CDN                   : sandbox.stub().returns({
                                name    : 'CDN',
                                execute : () => {}
                            }),
                            CheckProductExistence : sandbox.stub().returns({
                                name    : 'CheckProductExistence',
                                execute : () => {}
                            }),
                            CheckUpdate           : sandbox.stub().returns({
                                name    : 'CheckUpdate',
                                execute : () => {}
                            }),
                            GetProduct            : sandbox.stub().returns({
                                name    : 'GetProduct',
                                execute : function () {
                                    return new Promise((resolve, reject) => {
                                        reject(new Error('foo'));
                                    });
                                }
                            }),
                            HashFile              : sandbox.stub().returns({
                                name    : 'HashFile',
                                execute : () => {}
                            }),
                            SaveToDatabase        : sandbox.stub().returns({
                                name    : 'SaveToDatabase',
                                execute : () => {}
                            }),
                            SaveToStorage         : sandbox.stub().returns({
                                name    : 'SaveToStorage',
                                execute : () => {}
                            }),
                            ValidateArguments     : sandbox.stub().returns({
                                name    : 'ValidateArguments',
                                execute : () => {},
                                undo    : undo_stub
                            })
                        }
                    }
                }
            );
            const instance = new Release({
                modules : {}
            });

            mock.expects('log').exactly(12);

            const promise = instance.run({
                args : {
                    name : 'name',
                    path : 'path'
                }
            });

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');

                    expect(undo_stub).to.be.called;

                    mock.verify();
                });
        });
    });
});
