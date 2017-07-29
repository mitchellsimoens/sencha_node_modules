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

    it('should be an login adapter', function () {
        adapter = new Adapter();

        expect(adapter).to.have.property('isLoginAdapter', true);
    });

    describe('operations', function () {
        beforeEach(function () {
            adapter = this.createAdapter({
                callThru  : true,
                ForumGet  : 'fake.forum',
                SenchaGet : 'fake.sencha'
            });
        });

        it('should have default operations', function () {
            const { operations } = adapter;

            expect(operations).to.have.property('forum.get',  'fake.forum');
            expect(operations).to.have.property('sencha.get', 'fake.sencha');
        });
    });

    describe('getOperation', function () {
        describe('resolve', function () {
            beforeEach(function () {
                adapter = this.createAdapter({
                    callThru : true
                });
            });

            it('should get forum.get operation', function () {
                const operation = adapter.getOperation('forum.get');

                expect(operation).to.have.property('name', 'ForumGet');
            });

            it('should get sencha.get operation', function () {
                const operation = adapter.getOperation('sencha.get');

                expect(operation).to.have.property('name', 'SenchaGet');
            });

            it('should get unknown.save operation', function () {
                const operation = adapter.getOperation('unknown.save');

                expect(operation).to.have.property('name', 'UnknownSave');
            });
        });

        describe('with classes', function () {
            const ForumGet  = { isloginOperation : true };
            const SenchaGet = { isloginOperation : true };

            beforeEach(function () {
                adapter = this.createAdapter({
                    ForumGet, SenchaGet,
                    callThru : true
                });
            });

            it('should get operation by passing a class', function () {
                class foo extends Base {};

                foo.prototype.isloginOperation = true;

                const operation = adapter.getOperation(foo);

                expect(operation).to.equal(foo);
            });

            it('should get forum.get operation', function () {
                const operation = adapter.getOperation('forum.get');

                expect(operation).to.equal(ForumGet);
            });

            it('should get sencha.get operation', function () {
                const operation = adapter.getOperation('sencha.get');

                expect(operation).to.equal(SenchaGet);
            });
        });
    });

    describe('instantiateOperation', function () {
        describe('resolve', function () {
            beforeEach(function () {
                adapter = this.createAdapter({
                    callThru : true
                });
            });

            it('should instantiate forum.get operation', function () {
                const operation = adapter.instantiateOperation('forum.get');

                expect(operation).to.have.property('isInstance', true);
            });

            it('should instantiate sencha.get operation', function () {
                const operation = adapter.instantiateOperation('sencha.get');

                expect(operation).to.have.property('isInstance', true);
            });

            it('should instantiate unknown.save operation', function () {
                const operation = adapter.instantiateOperation('unknown.save');

                expect(operation).to.have.property('isInstance', true);
            });
        });

        describe('with classes', function () {
            class ForumGet {}
            class SenchaGet {}

            beforeEach(function () {
                adapter = this.createAdapter({
                    ForumGet, SenchaGet,
                    callThru : true
                });
            });

            it('should instantiate forum.get operation', function () {
                const operation = adapter.instantiateOperation('forum.get');

                expect(operation).to.be.instanceOf(ForumGet);
            });

            it('should instantiate sencha.get operation', function () {
                const operation = adapter.instantiateOperation('sencha.get');

                expect(operation).to.be.instanceOf(SenchaGet);
            });
        });
    });
});
