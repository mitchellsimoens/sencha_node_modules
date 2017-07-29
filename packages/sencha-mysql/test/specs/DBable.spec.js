const { expect }                      = require('chai');
const { Connection, DBable, Manager } = require('../../');
const { Base }                        = require('@extjs/sencha-core');

describe('DBable', function () {
    let Cls, instance;

    beforeEach(function () {
        Cls = class extends Base {
            static get meta () {
                return {
                    mixins : [
                        DBable
                    ]
                };
            }
        }
    });

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        Cls = instance = null;

        Manager.remove();
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Cls();
        });

        it('should be a DBable', function () {
            expect(instance).to.have.property('isDBable', true);
        });
    });

    describe('db', function () {
        describe('get', function () {
            beforeEach(function () {
                instance = new Cls();
            });

            it('should get all connections', function () {
                const result = instance.db;

                expect(result).to.be.a('map');
                expect(result).to.equal(Manager.get());
            });
        });

        describe('set', function () {
            it('should add databases during instantiation', function () {
                instance = new Cls({
                    db : {
                        foo : {}
                    }
                });

                const connection = Manager.get('foo');

                expect(connection).to.not.be.undefined;
                expect(connection).to.be.instanceOf(Connection);
            });

            it('should add databases using setter', function () {
                instance = new Cls();

                instance.db = {
                    foo : {}
                };

                const connection = Manager.get('foo');

                expect(connection).to.not.be.undefined;
                expect(connection).to.be.instanceOf(Connection);
            });

            it('should handle setting to undefined', function () {
                instance = new Cls();

                instance.db = undefined;

                const connection = Manager.get('foo');

                expect(connection).to.be.undefined;
            });
        });
    });
});
