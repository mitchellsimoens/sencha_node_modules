const { expect } = require('chai');

const {
    step : { nightly : { RemoveFromStorage } },
    util : { Logger }
} = require('../../../../');

describe('RemoveFromStorage step', function () {
    it('should remove nightlies', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const step = new RemoveFromStorage();
        const res  = step.execute({
            getData : sandbox.stub().returns([
                { sha1 : 'sha1' }
            ]),
            info    : {
                app       : {
                    storage : {
                        remove : sandbox.stub().resolves()
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

        const step = new RemoveFromStorage();
        const res  = step.execute({
            getData : sandbox.stub().returns([
                { sha1 : 'sha1' }
            ]),
            info    : {
                app       : {
                    storage : {
                        remove : sandbox.stub().rejects(new Error('foo'))
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

    it('should note remove nightlies if more than 1 shared', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const step = new RemoveFromStorage();
        const res  = step.execute({
            getData : sandbox.stub().returns([
                { sha1 : 'sha1', num_shared : 2 }
            ]),
            info    : {
                app       : {
                    storage : {
                        remove : sandbox.stub().resolves()
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

    it('should resolve when no nightlies are to be removed', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').once();

        const step = new RemoveFromStorage();
        const res  = step.execute({
            getData : sandbox.stub().returns([]),
            info    : {
                app       : {
                    storage : {
                        remove : sandbox.stub().resolves()
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
