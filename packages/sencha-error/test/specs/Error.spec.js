const { expect }         = require('chai');
const { Error, Manager } = require('../../');

describe('Error', function () {
    let error;

    afterEach(function () {
        if (error) {
            error.destroy();
            error = null;
        }
    });

    describe('instantiation', function () {
        it('should have default properties', function () {
            error = new Error();

            expect(error).to.have.property('isError', true);
        });

        it('should handle payload', function () {
            error = new Error(this.createPayload());

            expect(error).to.have.property('date');
            expect(error).to.have.property('ua');

            expect(error).to.have.property('user');

            expect(error).to.have.property('app');

            expect(error).to.have.property('browser');

            expect(error).to.have.property('error');

            expect(error).to.have.property('location');

            expect(error).to.have.property('platform');
        });
    });

    describe('save', function () {
        beforeEach(function () {
            Manager.adapter = this.createAdapter({
                callThru : true
            });
        });

        afterEach(function () {
            Manager.adapter = null;
        });

        it('should return a promise', function () {
            error = new Error(this.createPayload());

            const promise = error.save();

            expect(promise).to.be.a('promise');

            return promise.catch(() => {});
        });

        it('should combine all operations', function () {
            error = new Error(this.createPayload());

            const promise = error.save({});

            return promise
                .then(ret => {
                    expect(ret).to.equal(error);
                })
                .catch(() => {
                    //this shouldn't be called so this can trigger a failure
                    expect(false).to.be.true;
                });
        });

        it('should execute connection if one is passed', function () {
            error = new Error(this.createPayload());

            const batch      = 'fakebatch';
            const spy        = this.sandbox.spy();
            const connection = {
                exec : spy
            };
            const promise    = error.save({
                batch,
                connection
            });

            return promise
                .then(ret => {
                    expect(ret).to.equal(error);
                    expect(spy).to.have.been.called;
                    expect(spy).to.have.been.calledWith('fakebatch');
                })
                .catch(() => {
                    //this shouldn't be called so this can trigger a failure
                    expect(false).to.be.true;
                });
        });
    });
});
