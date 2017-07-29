const { expect } = require('chai');
const proxyquire = require('proxyquire');
const { Error }  = require('@extjs/sencha-error');
const { save }   = require('../../../../operation/location');

describe('location save operation', function () {
    let error, operation, payload;

    afterEach(function () {
        if (error) {
            error.destroy();
        }

        if (operation) {
            operation.destroy();
        }

        error = operation = payload = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            operation = new save();
        });

        it('should be an location saver', function () {
            expect(operation).to.have.property('isLocationSaver', true);
        });
    });

    describe('save', function () {
        beforeEach(function () {
            payload   = this.createPayload();
        });

        it('should return a promise', function () {
            const Batch = this.createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this.createFakeQuery({
                            resolveWith : {}
                        })
                    }
                }
            );

            error     = new Error(payload);
            operation = new save({
                error
            });

            const promise = operation.save(error, new Batch());

            expect(promise).to.be.a('promise');

            return promise;
        });

        it('should add query to batch', function () {
            const Batch = this.createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this.createFakeQuery({
                            resolveWith : {}
                        })
                    }
                }
            );

            const batch = new Batch();
            const spy   = this.sandbox.spy(batch, 'add');

            error     = new Error(payload);
            operation = new save({
                error
            });

            const promise = operation.save(error, batch);

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(spy).to.have.been.called;
                });
        });

        it('should resolve if query resolves', function () {
            const Batch = this.createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this.createFakeQuery({
                            resolveWith : {}
                        })
                    }
                }
            );

            error     = new Error(payload);
            operation = new save({
                error
            });

            const promise = operation.save(error, new Batch());

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    expect(true).to.be.true;
                })
                .catch(() => {
                    // this shouldn't execute, trigger a failure
                    expect(false).to.be.true;
                });
        });

        it('should reject if query rejects', function () {
            const Batch = this.createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this.createFakeQuery({
                            rejectWith : 'foobar'
                        })
                    }
                }
            );

            error     = new Error(payload);
            operation = new save({
                error
            });

            const promise = operation.save(error, new Batch());

            expect(promise).to.be.a('promise');

            return promise
                .then(() => {
                    // this shouldn't execute, trigger a failure
                    expect(false).to.be.true;
                })
                .catch(() => {
                    expect(true).to.be.true;
                });
        });
    });

    describe('$parse', function () {
        beforeEach(function () {
            operation = new save();
            payload   = this.createPayload();
        });

        it('should return valid error data', function () {
            error     = new Error(payload);
            operation = new save({
                error
            });

            const data = operation.$parse(error);

            expect(data).to.be.an('object');

            expect(data).to.have.deep.property('hash',     '#login');
            expect(data).to.have.deep.property('host',     'support.sencha.com');
            expect(data).to.have.deep.property('href',     'https://support.sencha.com/#login');
            expect(data).to.have.deep.property('origin',   'https://support.sencha.com');
            expect(data).to.have.deep.property('pathname', '/');
            expect(data).to.have.deep.property('port',     null);
            expect(data).to.have.deep.property('protocol', 'https:');
            expect(data).to.have.deep.property('referer',  '');
            expect(data).to.have.deep.property('search',   '');
        });
    });
});
