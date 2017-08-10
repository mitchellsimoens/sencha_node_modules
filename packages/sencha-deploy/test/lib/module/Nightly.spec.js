const { expect } = require('chai');
const proxyquire = require('proxyquire');
const sinon      = require('sinon');

const {
    module : { Nightly },
    util   : { Logger }
} = require('../../../');

describe('Nightly Module', () => {
    it('instantiate', () => {
        const instance = new Nightly('foo');

        expect(instance.config).to.eql('foo');
    });

    describe('run', () => {
        it('should run all steps', () => {
            const mock        = sinon.mock(Logger);
            const Nightly     = proxyquire(
                '../../../lib/module/Nightly',
                {
                    '../' : {
                        step : {
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
                            PruneNightly : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'PruneNightly'
                            }),
                            QA : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'QA'
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
            const instance = new Nightly({
                modules : {}
            });

            mock.expects('log').exactly(22);

            const res = instance.run({
                args : {
                    name : 'name',
                    path : 'path'
                }
            });

            return res
                .then(() => {
                    mock.verify();
                })
                .catch((e) => {
                    expect(false).to.be.true;
                });
        });

        it('should handle error in step', () => {
            const mock        = sinon.mock(Logger);
            const undoStub    = sinon.stub();
            const Nightly     = proxyquire(
                '../../../lib/module/Nightly',
                {
                    '../' : {
                        step : {
                            CheckProductExistence : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'CheckProductExistence'
                            }),
                            GetProduct : sinon.stub().returns({
                                execute : () => new Promise((resolve, reject) => {
                                    reject(new Error('foo'));
                                }),
                                name : 'GetProduct'
                            }),
                            HashFile : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'HashFile'
                            }),
                            PruneNightly : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'PruneNightly'
                            }),
                            QA : sinon.stub().returns({
                                execute : () => {}, // eslint-disable-line no-empty-function
                                name    : 'QA'
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
            const instance = new Nightly({
                modules : {}
            });

            mock.expects('log').exactly(10);

            const res = instance.run({
                args : {
                    name : 'name',
                    path : 'path'
                }
            });

            return res
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(() => {
                    expect(undoStub).to.be.called;

                    mock.verify();
                });
        });
    });
});
