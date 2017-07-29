const { expect } = require('chai');
const proxyquire = require('proxyquire');
const { Error }  = require('@extjs/sencha-error');
const { save }   = require('../../../../operation/error');

describe('error save operation', function () {
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

        it('should be an error saver', function () {
            expect(operation).to.have.property('isErrorSaver', true);
        });
    });

    describe('save', function () {
        beforeEach(function () {
            payload   = this.createPayload();
        });

        it('should return a promise', function () {
            const Batch = this.createBatch();
            const save  = proxyquire(
                '../../../../operation/error/save',
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
                '../../../../operation/error/save',
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
                '../../../../operation/error/save',
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
                '../../../../operation/error/save',
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

            //expect(data).to.have.deep.property('date',         new Date());
            expect(data).to.have.deep.property('apiKey',       'abcd');
            expect(data).to.have.deep.property('appVersion',   '2.1.0.1');
            expect(data).to.have.deep.property('column',       14);
            expect(data).to.have.deep.property('fileName',     'foo.js');
            expect(data).to.have.deep.property('line',         23);
            expect(data).to.have.deep.property('message',      'Script Error');
            expect(data).to.have.deep.property('name',         'Error');
            expect(data).to.have.deep.property('sourceClass',  'App.Foo');
            expect(data).to.have.deep.property('sourceMethod', 'doSomething');
            expect(data).to.have.deep.property('stack',        'Error: foo\n    at http://localhost:3001/app/Application.js?_dc=20170311065828:192:19');
            expect(data).to.have.deep.property('userid',       null);
        });

        it('should return valid error data with user data', function () {
            payload.user = {
                id : 1234
            };

            error     = new Error(payload);
            operation = new save({
                error
            });

            const data = operation.$parse(error);

            expect(data).to.be.an('object');

            //expect(data).to.have.deep.property('date',         new Date());
            expect(data).to.have.deep.property('apiKey',       'abcd');
            expect(data).to.have.deep.property('appVersion',   '2.1.0.1');
            expect(data).to.have.deep.property('column',       14);
            expect(data).to.have.deep.property('fileName',     'foo.js');
            expect(data).to.have.deep.property('line',         23);
            expect(data).to.have.deep.property('message',      'Script Error');
            expect(data).to.have.deep.property('name',         'Error');
            expect(data).to.have.deep.property('sourceClass',  'App.Foo');
            expect(data).to.have.deep.property('sourceMethod', 'doSomething');
            expect(data).to.have.deep.property('stack',        'Error: foo\n    at http://localhost:3001/app/Application.js?_dc=20170311065828:192:19');
            expect(data).to.have.deep.property('userid',       1234);
        });

        it('should return valid error data with stack as an array', function () {
            payload.error.stack = payload.error.stack.split('\n');

            error     = new Error(payload);
            operation = new save({
                error
            });

            const data = operation.$parse(error);

            expect(data).to.be.an('object');

            //expect(data).to.have.deep.property('date',         new Date());
            expect(data).to.have.deep.property('apiKey',       'abcd');
            expect(data).to.have.deep.property('appVersion',   '2.1.0.1');
            expect(data).to.have.deep.property('column',       14);
            expect(data).to.have.deep.property('fileName',     'foo.js');
            expect(data).to.have.deep.property('line',         23);
            expect(data).to.have.deep.property('message',      'Script Error');
            expect(data).to.have.deep.property('name',         'Error');
            expect(data).to.have.deep.property('sourceClass',  'App.Foo');
            expect(data).to.have.deep.property('sourceMethod', 'doSomething');
            expect(data).to.have.deep.property('stack',        'Error: foo\n    at http://localhost:3001/app/Application.js?_dc=20170311065828:192:19');
            expect(data).to.have.deep.property('userid',       null);
        });
    });
});
