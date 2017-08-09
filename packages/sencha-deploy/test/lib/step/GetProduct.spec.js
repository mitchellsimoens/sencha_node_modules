const { expect } = require('chai');

const {
    step : { GetProduct },
    util : { Logger }
} = require('../../../');

describe('GetProduct step', function () {
    it('get product object by code', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').twice();

        const runner = {
            info : {
                app       : {
                    database : {
                        query : sandbox.stub().resolves('foo')
                    }
                },
                args      : {
                    product : 'foo'
                },
                moduleCfg : {
                    mysql  : {
                        table : 'table'
                    }
                }
            }
        };
        const step   = new GetProduct();
        const res    = step.execute(runner);

        return res
            .then(() => {
                //expect(runner).to.have.deep.property('info.product', 'foo');
                expect(runner.info).to.have.property('product', 'foo')

                mock.verify();
            })
            .catch(() => {
                expect(false).to.be.true;
            });
    });

    it('get product object by code when array returned', function () {
        const { sandbox } = this;
        const mock       = sandbox.mock(Logger);

        mock.expects('log').twice();

        const runner = {
            info : {
                app       : {
                    database : {
                        query : sandbox.stub().resolves([ 'foo' ])
                    }
                },
                args      : {
                    product : 'foo'
                },
                moduleCfg : {
                    mysql  : {
                        table : 'table'
                    }
                }
            }
        };
        const step   = new GetProduct();
        const res    = step.execute(runner);

        return res
            .then(() => {
                //expect(runner).to.have.deep.property('info.product', 'foo');
                expect(runner.info).to.have.property('product', 'foo');

                mock.verify();
            })
            .catch(() => {
                expect(false).to.be.true;
            });
    });

    it('reject if no product found', function () {
        const { sandbox } = this;
        const mock       = sandbox.mock(Logger);

        mock.expects('log').once();

        const step = new GetProduct();
        const res  = step.execute({
            info : {
                app       : {
                    database : {
                        query : sandbox.stub().resolves()
                    }
                },
                args      : {
                    product : 'foo'
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
                expect(error.message).to.equal('Product is not found.');

                mock.verify();
            });
    });

    it('reject if error occurs', function () {
        const { sandbox } = this;
        const mock        = sandbox.mock(Logger);

        mock.expects('log').once();

        const step = new GetProduct();
        const res  = step.execute({
            info : {
                app       : {
                    database : {
                        query : sandbox.stub().rejects(new Error('foo'))
                    }
                },
                args      : {
                    product : 'foo'
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
