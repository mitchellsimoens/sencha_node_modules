const { expect }  = require('chai');
const { Adapter } = require('../../');
const { Base }    = require('@extjs/sencha-core')

describe('Adapter', function () {
    let adapter;

    afterEach(function () {
        if (adapter) {
            adapter.destroy();
            adapter = null;
        }
    });

    it('should be an error adapter', function () {
        adapter = new Adapter();

        expect(adapter).to.have.property('isErrorAdapter', true);
    });

    describe('operations', function () {
        beforeEach(function () {
            adapter = this[ 'sencha-error' ].createAdapter({
                callThru : true,
                env      : 'fake.env',
                error    : 'fake.error',
                location : 'fake.location'
            });
        });

        it('should have default operations', function () {
            const { operations } = adapter;

            expect(operations).to.have.property('env.save',      'fake.env');
            expect(operations).to.have.property('error.save',    'fake.error');
            expect(operations).to.have.property('location.save', 'fake.location');
        });
    });

    describe('getOperation', function () {
        describe('resolve', function () {
            beforeEach(function () {
                adapter = this[ 'sencha-error' ].createAdapter({
                    callThru : true
                });
            });

            it('should get env.save operation', function () {
                const operation = adapter.getOperation('env.save');

                expect(operation).to.have.property('name', 'EnvSave');
            });

            it('should get error.save operation', function () {
                const operation = adapter.getOperation('error.save');

                expect(operation).to.have.property('name', 'ErrorSave');
            });

            it('should get location.save operation', function () {
                const operation = adapter.getOperation('location.save');

                expect(operation).to.have.property('name', 'LocationSave');
            });

            it('should get unknown.save operation', function () {
                const operation = adapter.getOperation('unknown.save');

                expect(operation).to.have.property('name', 'UnknownSave');
            });
        });

        describe('with classes', function () {
            const env      = { isErrorOperation : true };
            const error    = { isErrorOperation : true };
            const location = { isErrorOperation : true };

            beforeEach(function () {
                adapter = this[ 'sencha-error' ].createAdapter({
                    env, error, location,
                    callThru : true
                });
            });

            it('should get operation by passing a class', function () {
                class foo extends Base {};

                foo.prototype.isErrorOperation = true;

                const operation = adapter.getOperation(foo);

                expect(operation).to.equal(foo);
            });

            it('should get env.save operation', function () {
                const operation = adapter.getOperation('env.save');

                expect(operation).to.equal(env);
            });

            it('should get error.save operation', function () {
                const operation = adapter.getOperation('error.save');

                expect(operation).to.equal(error);
            });

            it('should get location.save operation', function () {
                const operation = adapter.getOperation('location.save');

                expect(operation).to.equal(location);
            });
        });
    });

    describe('instantiateOperation', function () {
        describe('resolve', function () {
            beforeEach(function () {
                adapter = this[ 'sencha-error' ].createAdapter({
                    callThru : true
                });
            });

            it('should instantiate env.save operation', function () {
                const operation = adapter.instantiateOperation('env.save');

                expect(operation).to.have.property('isInstance', true);
            });

            it('should instantiate error.save operation', function () {
                const operation = adapter.instantiateOperation('error.save');

                expect(operation).to.have.property('isInstance', true);
            });

            it('should instantiate location.save operation', function () {
                const operation = adapter.instantiateOperation('location.save');

                expect(operation).to.have.property('isInstance', true);
            });

            it('should instantiate unknown.save operation', function () {
                const operation = adapter.instantiateOperation('unknown.save');

                expect(operation).to.have.property('isInstance', true);
            });
        });

        describe('with classes', function () {
            class env {}
            class error {}
            class location {}

            beforeEach(function () {
                adapter = this[ 'sencha-error' ].createAdapter({
                    env, error, location,
                    callThru : true
                });
            });

            it('should instantiate env.save operation', function () {
                const operation = adapter.instantiateOperation('env.save');

                expect(operation).to.be.instanceOf(env);
            });

            it('should instantiate error.save operation', function () {
                const operation = adapter.instantiateOperation('error.save');

                expect(operation).to.be.instanceOf(error);
            });

            it('should instantiate location.save operation', function () {
                const operation = adapter.instantiateOperation('location.save');

                expect(operation).to.be.instanceOf(location);
            });
        });
    });
});
