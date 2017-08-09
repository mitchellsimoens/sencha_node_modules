const { expect } = require('chai');
const proxyquire = require('proxyquire');

const {
    error : { FatalError },
    util  : { Config }
} = require('../../../');

describe('CheckUpdate step', function () {
    it('should stop if update is available', function () {
        const { sandbox } = this;
        const Module      = proxyquire(
            '../../../lib/step/CheckUpdate',
            {
                '../' : {
                    util : {
                        Config,
                        Update : sandbox.stub().returns({
                            checkIfOutdated : sandbox.stub().rejects(new FatalError('Please update script to version 1.2.3 by "npm install -g foo.git'))
                        })
                    }
                }
            }
        );

        const instance = new Module();
        const res      = instance.execute();

        return res
            .then(() => {
                expect(false).to.be.true;
            })
            .catch(error => {
                expect(error.message).to.equal('Please update script to version 1.2.3 by "npm install -g foo.git');
            });
    });

    it('should resolve if update is available', function () {
        const { sandbox } = this;
        const Module      = proxyquire(
            '../../../lib/step/CheckUpdate',
            {
                '../' : {
                    util : {
                        Config : {
                            config : {
                                versioning : {
                                    continueIfOutdated : true
                                }
                            }
                        },
                        Update : sandbox.stub().returns({
                            checkIfOutdated : sandbox.stub().resolves()
                        })
                    }
                }
            }
        );

        const instance = new Module();
        const res      = instance.execute();

        return res
            .then(() => {
                expect(true).to.be.true;
            })
            .catch(() => {
                expect(false).to.be.true;
            });
    });
});
