const { expect }    = require('chai');

const {
    step : { SaveToStorage },
    util : { Logger }
} = require('../../../');

describe('SaveToStorage step', function () {
    describe('execute', function () {
        it('should upload to storage', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().resolves();
            const step = new SaveToStorage();
            const res  = step.execute({
                getData : function() {},
                info    : {
                    app       : {
                        storage : {
                            upload : stub
                        }
                    },
                    args      : {},
                    moduleCfg : {
                        forceStorageUpload : false
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

        it('should skip uploading to storage', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').once();

            const stub = sandbox.stub().resolves();
            const step = new SaveToStorage();
            const res  = step.execute({
                getData : sandbox.stub().returns({}),
                info    : {
                    app       : {
                        storage : {
                            upload : stub
                        }
                    },
                    args      : {},
                    moduleCfg : {
                        forceStorageUpload : false
                    }
                }
            });

            expect(res).to.be.true;

            mock.verify();
        });

        it('should force upload to storage', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().resolves();
            const step = new SaveToStorage();
            const res  = step.execute({
                getData : sandbox.stub().returns({}),
                info    : {
                    app       : {
                        storage : {
                            upload : stub
                        }
                    },
                    args      : {
                        forceStorageUpload : true
                    },
                    moduleCfg : {
                        forceStorageUpload : false
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

        it('should handle error when uploading', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().rejects(new Error('foo'));
            const step = new SaveToStorage();
            const res  = step.execute({
                getData : sandbox.stub().returns({}),
                info    : {
                    app       : {
                        storage : {
                            upload : stub
                        }
                    },
                    args      : {
                        forceStorageUpload : true
                    },
                    moduleCfg : {
                        forceStorageUpload : false
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

    describe('undo', function () {
        it('should undo', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().resolves();
            const step = new SaveToStorage();

            step.result = {};

            const res  = step.undo({
                getData : () => {},
                info    : {
                    app  : {
                        storage : {
                            remove : stub
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

        it('should skip undo', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').once();

            const stub = sandbox.stub().resolves();
            const step = new SaveToStorage();
            const res  = step.undo({
                getData : () => {},
                info    : {
                    app  : {
                        storage : {
                            remove : stub
                        }
                    }
                }
            });

            expect(res).to.be.true;

            mock.verify();
        });

        it('should handle error on undo', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().rejects(new Error('foo'));
            const step = new SaveToStorage();

            step.result = {};

            const res  = step.undo({
                getData : () => {},
                info    : {
                    app  : {
                        storage : {
                            remove : stub
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
});
