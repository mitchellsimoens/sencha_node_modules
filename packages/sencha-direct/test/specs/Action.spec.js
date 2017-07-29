const { expect } = require('chai');

const { Action } = require('./../../');

describe('Sencha.direct.Action', function () {
    let action;

    afterEach(function () {
        if (action) {
            action.destroy();
            action = null;
        }
    });

    describe('instantiation', function () {
        it('should be an action', function () {
            action = new Action();

            expect(action).to.have.property('isDirectAction', true);
        });

        it('should set batched', function () {
            action = new Action({
                batched : true
            });

            expect(action).to.have.property('batched', true);
        });

        it('should set formHandler', function () {
            action = new Action({
                formHandler : true
            });

            expect(action).to.have.property('formHandler', true);
        });

        it('should set len', function () {
            action = new Action({
                len : 10
            });

            expect(action).to.have.property('len', 10);
        });

        it('should set metadata', function () {
            action = new Action({
                metadata : {}
            });

            expect(action.metadata).to.be.a('object');
        });

        it('should set name', function () {
            action = new Action({
                name : 'Foo'
            });

            expect(action).to.have.property('name', 'Foo');
        });

        it('should set params', function () {
            action = new Action({
                params : [ 1 ]
            });

            expect(action).to.have.deep.property('params[0]', 1);
        });

        it('should set paramOrder', function () {
            action = new Action({
                paramOrder : [ 'foo', 'bar' ]
            });

            expect(action).to.have.deep.property('paramOrder[1]', 'bar');
        });

        it('should set paramsAsHash', function () {
            action = new Action({
                paramsAsHash : false
            });

            expect(action).to.have.property('paramsAsHash', false);
        });

        it('should set strict', function () {
            action = new Action({
                strict : false
            });

            expect(action).to.have.property('strict', false);
        });
    });

    describe('serialize', function () {
        it('should serialize', function () {
            action = new Action();

            expect(action.serialize).to.be.a('object');
        });

        it('should serialize with batched', function () {
            action = new Action({
                batched : true
            });

            expect(action.serialize).to.have.property('batched', true);
        });

        it('should serialize with formHandler', function () {
            action = new Action({
                formHandler : true
            });

            expect(action.serialize).to.have.property('formHandler', true);
        });

        it('should serialize with len', function () {
            action = new Action({
                len : 10
            });

            expect(action.serialize).to.have.property('len', 10);
        });

        it('should serialize with metadata', function () {
            action = new Action({
                metadata : {}
            });

            expect(action.serialize.metadata).to.be.a('object');
        });

        it('should serialize with name', function () {
            action = new Action({
                name : 'Foo'
            });

            expect(action.serialize).to.have.property('name', 'Foo');
        });

        it('should serialize with params', function () {
            action = new Action({
                params : [ 1 ]
            });

            expect(action.serialize).to.have.deep.property('params[0]', 1);
        });

        it('should serialize with paramOrder', function () {
            action = new Action({
                paramOrder : [ 'foo', 'bar' ]
            });

            expect(action.serialize).to.have.deep.property('paramOrder[1]', 'bar');
        });

        it('should serialize with paramsAsHash', function () {
            action = new Action({
                paramsAsHash : false
            });

            expect(action.serialize).to.have.property('paramsAsHash', false);
        });

        it('should serialize with strict', function () {
            action = new Action({
                strict : false
            });

            expect(action.serialize).to.have.property('strict', false);
        });
    });

    describe('getArgs', function () {
        describe('len', function () {
            it('should return empty array with null len and no args', function () {
                action = new Action();

                const args = action.getArgs();

                expect(args).to.be.a('array');
                expect(args).to.have.length(0);
            });

            it('should throw error with a len and with null args passed', function () {
                action = new Action({
                    len : 2
                });

                const fn = () => {
                    action.getArgs();
                };

                expect(fn).to.throw(Error, 'Expected 2 arguments, got 0 instead');
            });

            it('should handle non-array passed as an argument', function () {
                action = new Action({
                    len : 1
                });

                const args = action.getArgs('abc');

                expect(args).to.be.a('array');
                expect(args).to.have.length(1);
                expect(args).to.have.deep.property('[0]', 'abc');
            });

            it('should return empty array with null len and passing empty array', function () {
                action = new Action();

                const args = action.getArgs([]);

                expect(args).to.be.a('array');
                expect(args).to.have.length(0);
            });

            it('should return empty array with null len and passing non-empty array', function () {
                action = new Action();

                const args = action.getArgs([ 1, 2, 3 ]);

                expect(args).to.be.a('array');
                expect(args).to.have.length(0);
            });

            it('should throw if not enough arguments', function () {
                action = new Action({
                    len : 1
                });

                const fn = () => {
                    action.getArgs();
                };

                expect(fn).to.throw(Error, 'Expected 1 argument, got 0 instead');
            });

            it('should return filled array with 1 len and passing empty array', function () {
                action = new Action({
                    len : 1
                });

                const args = action.getArgs([ 1 ]);

                expect(args).to.be.a('array');
                expect(args).to.have.length(1);
                expect(args).to.have.deep.property('[0]', 1);
            });

            it('should return empty array with null len and passing non-empty array', function () {
                action = new Action({
                    len : 1
                });

                const args = action.getArgs([ 1, 2, 3 ]);

                expect(args).to.be.a('array');
                expect(args).to.have.length(1);
                expect(args).to.have.deep.property('[0]', 1);
            });
        });
    });

    describe('handle', function () {
        it('should throw if handle is not overridden', function () {
            class Foo extends Action {}

            action = new Foo();

            const fn = () => {
                action.handle();
            }

            expect(fn).to.throw(Error, 'Expected the `handle` method to be overridden.');
        });
    });
});
