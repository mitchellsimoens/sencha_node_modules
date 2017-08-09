const { expect } = require('chai');

const {
    step : { SaveToDatabase },
    util : { Logger }
} = require('../../../');

describe('SaveToDatabase step', function () {
    describe('execute', function () {
        it('should parse product info', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub();
            const step = new SaveToDatabase();
            const res  = step.execute({
                info : {
                    app       : {
                        database : {
                            query : stub.resolves({ insertId : 1 })
                        }
                    },
                    args      : {
                        active    : true,
                        dashboard : true,
                        version   : '1.0.0'
                    },
                    file      : {
                        md5  : 'md5',
                        sha1 : 'sha1'
                    },
                    moduleCfg : {
                        mysql  : {
                            table : 'table'
                        }
                    },
                    product   : {
                        id   : 1,
                        name : 'foo'
                    }
                }
            });

            return res
                .then(() => {
                    expect(stub).to.be.calledWith(
                        'INSERT INTO table SET ?;',
                        [
                            {
                                product_id     : 1,
                                name           : 'foo 1.0.0',
                                version        : '1.0.0',
                                release_date   : `${new Date().toISOString().substr(0, 10)} 00:00:00`,
                                md5            : 'md5',
                                sha1           : 'sha1',
                                active         : true,
                                dashboard      : true,
                                versionDisplay : '1.0.0',
                                platform       : null,
                                license        : undefined,
                                jre            : false
                            }
                        ]
                    );

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should insert into database', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().resolves({ insertId : 1 });
            const step = new SaveToDatabase();
            const res  = step.execute({
                info : {
                    app       : {
                        database : {
                            query : stub
                        }
                    },
                    args      : {
                        license  : 'gpl',
                        name     : 'Foo',
                        version  : '1.0.0'
                    },
                    file      : {
                        md5  : 'md5',
                        sha1 : 'sha1'
                    },
                    moduleCfg : {
                        mysql  : {
                            table : 'table'
                        }
                    },
                    product   : {
                        id : 1
                    }
                }
            });

            return res
                .then(() => {
                    expect(stub).to.be.calledWith(
                        'INSERT INTO table SET ?;',
                        [
                            {
                                active         : 0,
                                dashboard      : 0,
                                jre            : false,
                                license        : 'gpl',
                                md5            : 'md5',
                                name           : 'Foo',
                                platform       : null,
                                product_id     : 1,
                                release_date   : `${new Date().toISOString().substr(0, 10)} 00:00:00`,
                                sha1           : 'sha1',
                                version        : '1.0.0-gpl',
                                versionDisplay : '1.0.0'
                            }
                        ]
                    );

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle an error', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().rejects(new Error('foo'));
            const step = new SaveToDatabase();
            const res  = step.execute({
                info : {
                    app       : {
                        database : {
                            query : stub
                        }
                    },
                    args      : {
                        licence  : 'gpl',
                        name     : 'Foo',
                        platform : 'osx',
                        version  : '1.0.0'
                    },
                    file      : {
                        md5  : 'md5',
                        sha1 : 'sha1'
                    },
                    moduleCfg : {
                        mysql  : {
                            table : 'table'
                        }
                    },
                    product   : {
                        id : 1
                    }
                }
            });

            return res
                .then((error) => {
                    expect(error).to.be.an('error');

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('undo', function () {
        it('should undo', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().resolves({ affectedRows : 1 });
            const step = new SaveToDatabase();

            step.result = {
                insertId : 1
            };

            const res = step.undo({
                info : {
                    app       : {
                        database : {
                            query : stub
                        }
                    },
                    args      : {
                        licence  : 'gpl',
                        name     : 'Foo',
                        platform : 'osx',
                        version  : '1.0.0'
                    },
                    file      : {
                        md5  : 'md5',
                        sha1 : 'sha1'
                    },
                    moduleCfg : {
                        mysql  : {
                            table : 'table'
                        }
                    },
                    product   : {
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

        it('should handle an error while undoing', function () {
            const { sandbox } = this;
            const mock        = sandbox.mock(Logger);

            mock.expects('log').twice();

            const stub = sandbox.stub().rejects(new Error('foo'));
            const step = new SaveToDatabase();

            step.result = {
                insertId : 1
            };

            const res  = step.undo({
                info : {
                    app       : {
                        database : {
                            query : stub
                        }
                    },
                    args      : {
                        licence  : 'gpl',
                        name     : 'Foo',
                        platform : 'osx',
                        version  : '1.0.0'
                    },
                    file      : {
                        md5  : 'md5',
                        sha1 : 'sha1'
                    },
                    moduleCfg : {
                        mysql  : {
                            table : 'table'
                        }
                    },
                    product   : {
                        id : 1
                    }
                }
            });

            return res
                .then((error) => {
                    expect(error).to.be.an('error');

                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });
});
