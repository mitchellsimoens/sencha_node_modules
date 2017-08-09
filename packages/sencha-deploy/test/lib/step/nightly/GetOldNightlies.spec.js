const { expect } = require('chai');

const {
    step : { nightly : { GetOldNightlies } },
    util : { Logger }
} = require('../../../../');

describe('GetOldNightlies step', function () {
    it('should find old nightlies', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const step = new GetOldNightlies();
        const res  = step.execute({
            addData : () => {},
            info    : {
                app       : {
                    database : {
                        query : sandbox.stub().resolves([ 'foo' ])
                    }
                },
                moduleCfg : {
                    ttl    : '10 DAY',
                    mysql  : {
                        table : 'table'
                    }
                },
                product  : {
                    id : 1
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

    it('should resolve on error', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const step = new GetOldNightlies();
        const res  = step.execute({
            addData : () => {},
            info    : {
                app       : {
                    database : {
                        query : sandbox.stub().rejects(new Error('foo'))
                    }
                },
                moduleCfg : {
                    ttl    : '10 DAY',
                    mysql  : {
                        table : 'table'
                    }
                },
                product  : {
                    id : 1
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
