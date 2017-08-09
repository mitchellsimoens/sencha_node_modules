const { expect } = require('chai');
const proxyquire = require('proxyquire');

const { util : { Logger } } = require('../../../');

describe('PruneNightly step', function () {
    it('should prune nightlies', function () {
        const { sandbox } = this;
        const Module      = proxyquire(
            '../../../lib/step/PruneNightly',
            {
                '../' : {
                    step : {
                        nightly : {
                            GetOldNightlies    : sandbox.stub().returns({
                                name    : 'GetOldNightlies',
                                execute : function () {}
                            }),
                            RemoveFromDatabase : sandbox.stub().returns({
                                name    : 'RemoveFromDatabase',
                                execute : function () {}
                            }),
                            RemoveFromStorage  : sandbox.stub().returns({
                                name    : 'RemoveFromStorage',
                                execute : function () {}
                            })
                        }
                    }
                }
            }
        );

        const mock = sandbox.mock(Logger);

        mock.expects('log').exactly(6);

        const instance = new Module();
        const res      = instance.execute({
            info : {}
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
