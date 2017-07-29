const { expect }         = require('chai');
const { Forum, Manager } = require('../../');

describe('Forum', function () {
    let instance;

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Forum();
        });

        it('should be a forum user', function () {
            expect(instance).to.have.property('isForumUser', true);
        });
    });

    describe('static load', function () {
        it('should reject if no info passed', function () {
            return Forum
                .load()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No info to load with');
                });
        });

        it('should reject if no userid, username and email provided', function () {
            return Forum
                .load({})
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid", "username" or "email" to load with');
                });
        });

        it('should load successfully', function () {
            let resolveFn;

            const getById       = this.sandbox.stub().resolves({ userid : 1234 });
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getById
            });
            const exec = this.sandbox.stub().callsFake(() => {
                resolveFn({ userid : 1234 });
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            return Forum
                .load({
                    userid     : 1234,
                    batch,
                    connection : {
                        exec
                    }
                })
                .then(ret => {
                    expect(ret).to.be.instanceOf(Forum);
                    expect(ret).to.have.deep.property('data.userid', 1234);

                    expect(instantiateOp).to.have.been.calledWith('forum.get');
                    expect(getById).to.have.been.calledWith(1234, batch);
                    expect(exec).to.have.been.calledWith(batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should load successfully without a connection', function () {
            let resolveFn;

            const getById       = this.sandbox.stub().resolves({ userid : 1234 });
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                getById
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            resolveFn({ userid : 1234 });

            return Forum
                .load({
                    batch,
                    userid : 1234
                })
                .then(ret => {
                    expect(ret).to.be.instanceOf(Forum);
                    expect(ret).to.have.deep.property('data.userid', 1234);

                    expect(instantiateOp).to.have.been.calledWith('forum.get');
                    expect(getById).to.have.been.calledWith(1234, batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('static checkPassword', function () {
        it('should reject if no info passed', function () {
            return Forum
                .checkPassword()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No info to check with');
                });
        });

        it('should reject if no userid, username and email provided', function () {
            return Forum
                .checkPassword({})
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid", "username" or "email" and "password" to check with');
                });
        });

        it('should reject if no password provided', function () {
            return Forum
                .checkPassword({
                    userid : 1234
                })
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid", "username" or "email" and "password" to check with');
                });
        });

        it('should check successfully with userid', function () {
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

            return Forum
                .checkPassword({
                    batch,
                    userid     : 1234,
                    password   : 'mypassword',
                    connection : {
                        exec
                    }
                })
                .then(ret => {
                    expect(ret).to.be.true;

                    expect(instantiateOp).to.have.been.calledWith('forum.get');
                    expect(checkPassword).to.have.been.calledWith(1234, 'mypassword', batch);
                    expect(exec).to.have.been.calledWith(batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });

        it('should check successfully with userid without a connection', function () {
            let resolveFn;

            const checkPassword = this.sandbox.stub().resolves(true);
            const instantiateOp = this.sandbox.stub(Manager, 'instantiateOperation').returns({
                checkPassword
            });

            const batch = new Promise(resolve => {
                resolveFn = resolve;
            });

            resolveFn(true);

            return Forum
                .checkPassword({
                    batch,
                    userid   : 1234,
                    password : 'mypassword'
                })
                .then(ret => {
                    expect(ret).to.be.true;

                    expect(instantiateOp).to.have.been.calledWith('forum.get');
                    expect(checkPassword).to.have.been.calledWith(1234, 'mypassword', batch);
                })
                .catch(() => {
                    expect(false).to.be.true;
                });
        });
    });

    describe('static encryptPasswordForCookie', function () {
        it('should return a hashed password', function () {
            const result = Forum.encryptPasswordForCookie('foo');

            expect(result).to.equal('1d6e529e17b0b5cd20c362250b810c3c');
        });

        it('should return a hashed password with provided salt', function () {
            const result = Forum.encryptPasswordForCookie('foo', 'bar');

            expect(result).to.equal('3858f62230ac3c915f300c664312c63f');
        });

        it('should throw if no password provided', function () {
            const fn = () => {
                Forum.encryptPasswordForCookie();
            };

            expect(fn).to.throw(Error, 'A password was not provided');
        });
    });

    describe('save', function () {
        it('should reject if no info passed', function () {
            instance = new Forum();

            return instance
                .save()
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No info to save with');
                });
        });

        it('should reject if no userid passed', function () {
            instance = new Forum();

            return instance
                .save({})
                .then(() => {
                    expect(false).to.be.true;
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid" to save with');
                });
        });

        it('should save successfully', function () {
            instance = new Forum({
                data : {
                    userid   : 1234,
                    username : 'foo'
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

                    expect(instantiateOp).to.have.been.calledWith('forum.save');
                    expect(save).to.have.been.calledWith(1234, { userid : 1234, username : 'foo' }, batch);
                    expect(exec).to.have.been.calledWith(batch);
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid" to save with');
                });
        });

        it('should save successfully', function () {
            instance = new Forum({
                data : {
                    userid   : 1234,
                    username : 'foo'
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

                    expect(instantiateOp).to.have.been.calledWith('forum.save');
                    expect(save).to.have.been.calledWith(1234, { userid : 1234, username : 'foo' }, batch);
                })
                .catch(error => {
                    expect(error.message).to.equal('No "userid" to save with');
                });
        });
    });
});
