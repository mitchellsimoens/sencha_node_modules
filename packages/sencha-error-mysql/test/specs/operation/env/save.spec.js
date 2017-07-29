const { expect } = require('chai');
const proxyquire = require('proxyquire');
const { Error }  = require('@extjs/sencha-error');
const { save }   = require('../../../../operation/env');

describe('env save operation', function () {
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

        it('should be an env saver', function () {
            expect(operation).to.have.property('isEnvSaver', true);
        });
    });

    describe('save', function () {
        beforeEach(function () {
            payload   = this.createPayload();
        });

        it('should return a promise', function () {
            const Batch = this.createBatch();
            const save  = proxyquire(
                '../../../../operation/env/save',
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
                '../../../../operation/env/save',
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
                '../../../../operation/env/save',
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
                '../../../../operation/env/save',
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

        it('should return valid env data', function () {
            error     = new Error(payload);
            operation = new save({
                error
            });

            const data = operation.$parse(error);

            expect(data).to.be.an('object');

            expect(data).to.have.deep.property('availHeight',          1000);
            expect(data).to.have.deep.property('availLeft',            0);
            expect(data).to.have.deep.property('availTop',             0);
            expect(data).to.have.deep.property('availWidth',           2000);
            expect(data).to.have.deep.property('Browser',              'Chrome');
            expect(data).to.have.deep.property('Browser-Height',       1000);
            expect(data).to.have.deep.property('Browser-MajorVersion', '59');
            expect(data).to.have.deep.property('Browser-Name',         'Chrome 59.0.3071.82');
            expect(data).to.have.deep.property('Browser-Version',      '59.0.3071.82');
            expect(data).to.have.deep.property('Browser-Width',        2000);
            expect(data).to.have.deep.property('colorDepth',           24);
            expect(data).to.have.deep.property('height',               1000);
            expect(data).to.have.deep.property('os',                   'macOS Sierra');
            expect(data).to.have.deep.property('orientation_angle',    0);
            expect(data).to.have.deep.property('orientation_type',     'landscape-primary');
            expect(data).to.have.deep.property('pixelDepth',           24);
            expect(data).to.have.deep.property('Platform',             'Apple Mac');
            expect(data).to.have.deep.property('ua',                   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.82 Safari/537.36');
            expect(data).to.have.deep.property('UtcOffset',            -4);
            expect(data).to.have.deep.property('width',                2000);
        });
    });
});
