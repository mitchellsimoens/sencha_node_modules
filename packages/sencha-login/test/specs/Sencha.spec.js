const { expect }          = require('chai');
const { Manager, Sencha } = require('../../');

describe('Sencha', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Sencha();
        });

        it('should be a sencha user', function () {
            expect(instance).to.have.property('isSenchaUser', true);
        });
    });

    describe('static load', function () {
        it('should reject if no info passed', function () {
            return Sencha
                .load()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No info to load with');
                });
        });

        it('should reject if no uid and email provided', function () {
            return Sencha
                .load({})
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "uid" or "email" to load with');
                });
        });

        it('should load successfully with uid', function () {
            let resolveFn;

            const getById       = this.sandbox.stub().resolves({ uid : 1234 });
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getById
            });
            const exec = this.sandbox.stub().callsFake(() => {
                resolveFn({ uid : 1234 });
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            return Sencha
                .load({
                    batch,
                    uid        : 1234,
                    connection : {
                        exec
                    }
                })
                .then(ret => {
                    expect(ret).to.be.instanceOf(Sencha);
                    expect(ret.data).to.have.deep.property('uid', 1234);

                    instantiateOp.should.have.been.calledWith('sencha.get');
                    getById.should.have.been.calledWith(1234, batch);
                    exec.should.have.been.calledWith(batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should load successfully with uid without a connection', function () {
            let resolveFn;

            const getById       = this.sandbox.stub().resolves({ uid : 1234 });
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getById
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            resolveFn({ uid : 1234 });

            return Sencha
                .load({
                    batch,
                    uid : 1234
                })
                .then(ret => {
                    expect(ret).to.be.instanceOf(Sencha);
                    expect(ret.data).to.have.deep.property('uid', 1234);

                    instantiateOp.should.have.been.calledWith('sencha.get');
                    getById.should.have.been.calledWith(1234, batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('static checkPassword', function () {
        it('should reject if no info passed', function () {
            return Sencha
                .checkPassword()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No info to check with');
                });
        });

        it('should reject if no uid and email provided', function () {
            return Sencha
                .checkPassword({})
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "uid" or "email" and "password" to check with');
                });
        });

        it('should reject if no password provided', function () {
            return Sencha
                .checkPassword({
                    uid : 1234
                })
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "uid" or "email" and "password" to check with');
                });
        });

        it('should check successfully with uid', function () {
            let resolveFn;

            const checkPassword = this.sandbox.stub().resolves(true);
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                checkPassword
            });
            const exec = this.sandbox.stub().callsFake(() => {
                resolveFn(true);
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            return Sencha
                .checkPassword({
                    batch,
                    uid        : 1234,
                    password   : 'mypassword',
                    connection : {
                        exec
                    }
                })
                .then(ret => {
                    expect(ret).to.be.true;

                    instantiateOp.should.have.been.calledWith('sencha.get');
                    checkPassword.should.have.been.calledWith(1234, 'mypassword', batch);
                    exec.should.have.been.calledWith(batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should check successfully with uid without a connection', function () {
            let resolveFn;

            const checkPassword = this.sandbox.stub().resolves(true);
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                checkPassword
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            resolveFn(true);

            return Sencha
                .checkPassword({
                    batch,
                    uid      : 1234,
                    password : 'mypassword'
                })
                .then(ret => {
                    expect(ret).to.be.true;

                    instantiateOp.should.have.been.calledWith('sencha.get');
                    checkPassword.should.have.been.calledWith(1234, 'mypassword', batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('save', function () {
        it('should reject if no info passed', function () {
            instance = new Sencha();

            return instance
                .save()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No info to save with');
                });
        });

        it('should reject if no uid passed', function () {
            instance = new Sencha();

            return instance
                .save({})
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "uid" to save with');
                });
        });

        it('should save successfully', function () {
            instance = new Sencha({
                data : {
                    uid       : 1234,
                    auth_data : 'foo'
                }
            });

            let resolveFn;

            const save          = this.sandbox.stub().resolves(true);
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                save
            });
            const exec = this.sandbox.stub().callsFake(() => {
                resolveFn(true);
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            return instance
                .save({
                    batch,
                    connection : {
                        exec
                    }
                })
                .then(ret => {
                    expect(ret).to.be.true;

                    instantiateOp.should.have.been.calledWith('sencha.save');
                    save.should.have.been.calledWith(1234, { uid : 1234, auth_data : 'foo' }, batch);
                    exec.should.have.been.calledWith(batch);
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid" to save with');
                });
        });

        it('should save successfully without a connection', function () {
            instance = new Sencha({
                data : {
                    uid       : 1234,
                    auth_data : 'foo'
                }
            });

            let resolveFn;

            const save          = this.sandbox.stub().resolves(true);
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                save
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            resolveFn(true);

            return instance
                .save({
                    batch
                })
                .then(ret => {
                    expect(ret).to.be.true;

                    instantiateOp.should.have.been.calledWith('sencha.save');
                    save.should.have.been.calledWith(1234, { uid : 1234, auth_data : 'foo' }, batch);
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid" to save with');
                });
        });
    });
});
