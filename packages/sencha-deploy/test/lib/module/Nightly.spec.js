const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    module : { Nightly },
    util   : { Logger }
} = require('../../../');

describe('Nightly Module', function () {
    it('instantiate', function () {
        let instance = new Nightly('foo');

        expect(instance.config).to.eql('foo');
    });

    describe('run', function () {
        it('should run all steps', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const Nightly     = proxyquire(
                '../../../lib/module/Nightly',
                {
                    '../' : {
                        step : {
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
                            PruneNightly          : sandbox.stub().returns({
                                name    : 'PruneNightly',
                                execute : () => {}
                            }),
                            QA                    : sandbox.stub().returns({
                                name    : 'QA',
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
            const instance = new Nightly({
                modules : {}
            });

            mock.expects('log').exactly(24);

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
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle error in step', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);
            const undo_stub   = sandbox.stub();
            const Nightly     = proxyquire(
                '../../../lib/module/Nightly',
                {
                    '../' : {
                        step : {
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
                                execute : () => {
                                    return new Promise((resolve, reject) => {
                                        reject(new Error('foo'));
                                    });
                                }
                            }),
                            HashFile              : sandbox.stub().returns({
                                name    : 'HashFile',
                                execute : () => {}
                            }),
                            PruneNightly          : sandbox.stub().returns({
                                name    : 'PruneNightly',
                                execute : () => {}
                            }),
                            QA                    : sandbox.stub().returns({
                                name    : 'QA',
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
            const instance = new Nightly({
                modules : {}
            });

            mock.expects('log').exactly(12);

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
                    expect(undo_stub).to.be.called;

                    mock.verify();
                });
        });
    });
});
