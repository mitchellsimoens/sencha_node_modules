const { expect } = require('chai');
const proxyquire = require('proxyquire');

const { util : { Logger, Progress } } = require('../../../');

describe('SCP2', function () {
    let instance,
        Client, SCP2;

    before(function () {
        Client = this[ 'sencha-deploy' ].createObservable();

        SCP2 = proxyquire(
            '../../../lib/transfer/SCP2',
            {
                '../' : {
                    transfer : {
                        Base : proxyquire(
                            '../../../lib/transfer/Base',
                            {
                                fs    : {
                                    readFileSync (key) {
                                        return 'buffer ' + key;
                                    }
                                },
                                path  : {
                                    resolve (...args) {
                                        return 'resolved ' + args.pop();
                                    }
                                }
                            }
                        )
                    }
                },
                scp2 : {
                    Client : Client,
                    scp    : function(source, config, client, callback) {
                        client.emit('event', null, 50, 100);

                        callback();
                    }
                }
            }
        );
    });

    afterEach(function () {
        instance = null;
    });

    describe('instantiation', function () {
        it('should call super', function () {
            instance = new SCP2({
                foo : 'bar'
            });

            //expect(instance).to.have.deep.property('config.foo', 'bar');
            expect(instance.config).to.have.property('foo', 'bar');
        });

        it('should create progress', function () {
            instance = new SCP2({});

            expect(instance.progress).to.be.instanceOf(Progress);
        });
    });

    describe('upload', function () {
        it('should return promise', function () {
            instance = new SCP2({});

            const mock = this.sandbox.mock(Logger);

            mock.expects('info').once();

            const promise = instance.upload('foo', 'bar');

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should fulfill promise on upload success', function () {
            instance = new SCP2({});

            const mock = this.sandbox.mock(Logger);

            mock.expects('info').once();

            const promise = instance.upload('foo', 'bar');

            return promise
                .then(() => {
                    mock.verify();
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should handle upload failure', function () {
            const SCP2Fail = proxyquire('../../../lib/transfer/SCP2', {
                './Base' : proxyquire('../../../lib/transfer/Base', {
                    fs    : {
                        readFileSync (key) {
                            return 'buffer ' + key;
                        }
                    },
                    path  : {
                        resolve (...args) {
                            return 'resolved ' + args.pop();
                        }
                    }
                }),

                scp2 : {
                    Client : Client,
                    scp    : function(source, config, client, callback) {
                        callback(new Error('foo'));
                    }
                }
            });

            const mock = this.sandbox.mock(Logger);

            mock.expects('info').once();

            instance = new SCP2Fail({});

            const promise = instance.upload('foo', 'bar');

            return promise
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('foo');

                    mock.verify();
                });
        });

        it('should add trailing slash to destination', function () {
            const mock = this.sandbox.mock(Logger);

            mock.expects('info').once();

            const SCP2 = proxyquire(
                '../../../lib/transfer/SCP2',
                {
                    '../' : {
                        transfer : {
                            Base : proxyquire(
                                '../../../lib/transfer/Base',
                                {
                                    fs    : {
                                        readFileSync (key) {
                                            return 'buffer ' + key;
                                        }
                                    },
                                    path  : {
                                        resolve (...args) {
                                            return 'resolved ' + args.pop();
                                        }
                                    }
                                }
                            )
                        }
                    },

                    scp2 : {
                        Client : Client,
                        scp    : function(source, config, client, callback) {
                            expect(config).to.have.property('path', 'bar/');

                            callback();
                        }
                    }
                }
            );

            instance = new SCP2({});

            return instance.upload('foo', 'bar');
        });

        it('should not add trailing slash to destination', function () {
            const mock = this.sandbox.mock(Logger);

            mock.expects('info').once();

            const SCP2 = proxyquire(
                '../../../lib/transfer/SCP2',
                {
                    '../' : {
                        transfer : {
                            Base : proxyquire(
                                '../../../lib/transfer/Base',
                                {
                                    fs    : {
                                        readFileSync (key) {
                                            return 'buffer ' + key;
                                        }
                                    },
                                    path  : {
                                        resolve (...args) {
                                            return 'resolved ' + args.pop();
                                        }
                                    }
                                }
                            )
                        }
                    },

                    scp2 : {
                        Client : Client,
                        scp    : function(source, config, client, callback) {
                            expect(config).to.have.property('path', 'bar/');

                            callback();
                        }
                    }
                }
            );

            instance = new SCP2({});

            return instance.upload('foo', 'bar/');
        });
    });

    describe('onTransfer', function () {
        it('should update progress during transfer', function () {
            const Progress = function Progress() {};

            const stub = Progress.prototype.update = this.sandbox.stub();

            const SCP2 = proxyquire(
                '../../../lib/transfer/SCP2',
                {
                    '../' : {
                        transfer : {
                            Base : proxyquire(
                                '../../../lib/transfer/Base',
                                {
                                    fs    : {
                                        readFileSync (key) {
                                            return 'buffer ' + key;
                                        }
                                    },
                                    path  : {
                                        resolve (...args) {
                                            return 'resolved ' + args.pop();
                                        }
                                    }
                                }
                            )
                        },
                        util     : {
                            Progress
                        }
                    },
                    scp2 : {
                        Client : Client,
                        scp    : function(source, config, client, callback) {
                            client.emit('event', [ null, 50, 100 ]);

                            callback();
                        }
                    }
                }
            );

            instance = new SCP2({});

            instance.upload('foo', 'bar');

            expect(stub).to.have.been.calledOnce;
        });

        it('should update progress on success', function () {
            const Progress = function Progress() {};

            const stub = Progress.prototype.update = this.sandbox.stub();

            const SCP2 = proxyquire(
                '../../../lib/transfer/SCP2',
                {
                    '../' : {
                        transfer : {
                            Base : proxyquire(
                                '../../../lib/transfer/Base',
                                {
                                    fs    : {
                                        readFileSync (key) {
                                            return 'buffer ' + key;
                                        }
                                    },
                                    path  : {
                                        resolve (...args) {
                                            return 'resolved ' + args.pop();
                                        }
                                    }
                                }
                            )
                        },
                        util     : {
                            Progress
                        }
                    },

                    scp2 : {
                        Client : Client,
                        scp    : function(source, config, client, callback) {
                            callback();
                        }
                    }
                }
            );

            instance = new SCP2({});

            return instance
                .upload('foo', 'bar')
                .then(() => {
                    expect(stub).to.have.been.calledWith(1);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });
});
