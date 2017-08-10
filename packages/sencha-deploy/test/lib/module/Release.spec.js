const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

const { util : { Logger } } = require('../../../');

describe('Release Module', () => {
    it('instantiate', () => {
        const Module = proxyquire(
            '../../../lib/module/Release',
            {
                '../storage'     : {},
                '../util/Logger' : {}
            }
        );

        const module = new Module('foo');

        expect(module.config).to.equal('foo');
    });

    describe('run', () => {
        it('should run all steps', () => {
            const mock        = sinon.mock(Logger);
            const Release     = proxyquire(
                '../../../lib/module/Release',
                {
                    '../' : {
                        step : {
                            CDN : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'CDN'
                            }),
                            CheckProductExistence : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'CheckProductExistence'
                            }),
                            GetProduct : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'GetProduct'
                            }),
                            HashFile : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'HashFile'
                            }),
                            SaveToDatabase : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'SaveToDatabase'
                            }),
                            SaveToStorage : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'SaveToStorage'
                            }),
                            ValidateArguments : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'ValidateArguments'
                            })
                        }
                    }
                }
            );
            const instance = new Release({
                modules : {}
            });

            mock.expects('log').exactly(20);

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

        it('should handle error in step', () => {
            const mock        = sinon.mock(Logger);
            const undoStub    = sinon.stub();
            const Release     = proxyquire(
                '../../../lib/module/Release',
                {
                    '../' : {
                        step : {
                            CDN : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'CDN'
                            }),
                            CheckProductExistence : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'CheckProductExistence'
                            }),
                            GetProduct : sinon.stub().returns({
                                execute : () => {
                                    return new Promise((resolve, reject) => {
                                        reject(new Error('foo'));
                                    });
                                },
                                name : 'GetProduct'
                            }),
                            HashFile : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'HashFile'
                            }),
                            SaveToDatabase : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'SaveToDatabase'
                            }),
                            SaveToStorage : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'SaveToStorage'
                            }),
                            ValidateArguments : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'ValidateArguments',
                                undo    : undoStub
                            })
                        }
                    }
                }
            );
            const instance = new Release({
                modules : {}
            });

            mock.expects('log').exactly(10);

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

                    expect(undoStub).to.be.called;

                    mock.verify();
                });
        });
    });
});
