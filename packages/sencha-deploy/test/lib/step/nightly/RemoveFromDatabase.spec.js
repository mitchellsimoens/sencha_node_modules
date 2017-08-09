const { expect } = require('chai');

const {
    step : { nightly : { RemoveFromDatabase } },
    util : { Logger }
} = require('../../../../');

describe('RemoveFromDatabase step', function () {
    it('should remove nightlies', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const step = new RemoveFromDatabase();
        const res  = step.execute({
            getData : sandbox.stub().returns([
                { id : 1 }
            ]),
            info    : {
                app       : {
                    database : {
                        query : sandbox.stub().resolves({
                            affectedRows : 1
                        })
                    }
                },
                moduleCfg : {
                    mysql  : {
                        table : 'product_nightly'
                    }
                }
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

    it('should still resolve', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const step = new RemoveFromDatabase();
        const res  = step.execute({
            getData : sandbox.stub().returns([
                { id : 1 }
            ]),
            info    : {
                app       : {
                    database : {
                        query : sandbox.stub().rejects(new Error('foo'))
                    }
                },
                moduleCfg : {
                    mysql  : {
                        table : 'product_nightly'
                    }
                }
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

    it('should resolve if no nightlies to remove', function () {
        const { sandbox } = this;
        const mock    = sandbox.mock(Logger);

        mock.expects('log').once();

        const step = new RemoveFromDatabase();
        const res  = step.execute({
            getData : sandbox.stub().returns([]),
            info    : {
                app       : {
                    database : {
                        query : sandbox.stub().resolves({
                            affectedRows : 1
                        })
                    }
                },
                moduleCfg : {
                    mysql  : {
                        table : 'product_nightly'
                    }
                }
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
});
