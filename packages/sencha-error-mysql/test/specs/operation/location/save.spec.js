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
            payload   = this[ 'sencha-error-mysql' ].createPayload();
        });

        it('should return a promise', function () {
            const Batch = this[ 'sencha-error-mysql' ].createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this[ 'sencha-error-mysql' ].createFakeQuery({
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
            const Batch = this[ 'sencha-error-mysql' ].createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this[ 'sencha-error-mysql' ].createFakeQuery({
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
                    spy.should.have.been.called;
                });
        });

        it('should resolve if query resolves', function () {
            const Batch = this[ 'sencha-error-mysql' ].createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this[ 'sencha-error-mysql' ].createFakeQuery({
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
            const Batch = this[ 'sencha-error-mysql' ].createBatch();
            const save  = proxyquire(
                '../../../../operation/location/save',
                {
                    '@extjs/sencha-mysql' : {
                        Query : this[ 'sencha-error-mysql' ].createFakeQuery({
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
            payload   = this[ 'sencha-error-mysql' ].createPayload();
        });

        it('should return valid error data', function () {
            error     = new Error(payload);
            operation = new save({
                error
            });

            const data = operation.$parse(error);

            expect(data).to.be.an('object');

            expect(data).to.have.property('hash',     '#login');
            expect(data).to.have.property('host',     'support.sencha.com');
            expect(data).to.have.property('href',     'https://support.sencha.com/#login');
            expect(data).to.have.property('origin',   'https://support.sencha.com');
            expect(data).to.have.property('pathname', '/');
            expect(data).to.have.property('port',     null);
            expect(data).to.have.property('protocol', 'https:');
            expect(data).to.have.property('referer',  '');
            expect(data).to.have.property('search',   '');
        });
    });
});
