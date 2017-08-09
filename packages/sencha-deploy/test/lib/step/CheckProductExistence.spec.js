const { expect } = require('chai');

const {
    step : { CheckProductExistence },
    util : { Logger }
} = require('../../../');

describe('CheckProductExistence step', function () {
    it('check if there is no such release in db', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const stub = sandbox.stub().resolves([]);
        const step = new CheckProductExistence();
        const res  = step.execute({
            addData : () => {},
            info    : {
                app       : {
                    database : {
                        query : stub
                    }
                },
                args      : {},
                file      : {
                    sha1 : 'sha1'
                },
                moduleCfg : {
                    mysql  : {
                        table : 'table'
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

    it('should resolve if such release exists', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const stub = sandbox.stub().resolves([ 'foo' ]);
        const step = new CheckProductExistence();
        const res  = step.execute({
            addData : () => {},
            info    : {
                app       : {
                    database : {
                        query : stub
                    }
                },
                args      : {},
                file      : {
                    sha1 : 'sha1'
                },
                moduleCfg : {
                    mysql  : {
                        table : 'table'
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

    it('should reject if such release exists', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const stub = sandbox.stub().resolves([ 'foo' ]);
        const step = new CheckProductExistence();
        const res  = step.execute({
            addData : () => {},
            info    : {
                app       : {
                    database : {
                        query : stub
                    }
                },
                args      : {
                    failOnDup : true
                },
                file      : {
                    sha1 : 'sha1'
                },
                moduleCfg : {
                    mysql  : {
                        table : 'table'
                    }
                }
            }
        });

        return res
            .then(() => {
                expect(false).to.be.true;
            })
            .catch(error => {
                expect(error.message).to.equal('Such release already exists in the database.');

                mock.verify();
            });
    });

    it('reject if error occurs', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').once();

        const stub = sandbox.stub().rejects(new Error('foo'));
        const step = new CheckProductExistence();
        const res  = step.execute({
            addData : function() {},
            info    : {
                app       : {
                    database : {
                        query : stub
                    }
                },
                args      : {},
                file      : {
                    sha1 : 'sha1'
                },
                moduleCfg : {
                    mysql  : {
                        table : 'table'
                    }
                }
            }
        });

        return res
            .then(() => {
                expect(false).to.be.true;
            })
            .catch(error => {
                expect(error.message).to.equal('foo');

                mock.verify();
        });
    });
});
