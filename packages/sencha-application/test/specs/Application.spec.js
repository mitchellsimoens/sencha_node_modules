const { expect }                  = require('chai');
const { Application, Controller } = require('../../');
const { Config }                  = require('@extjs/sencha-core');

describe('Application', function () {
    let instance;

    function testController (controller) {
        expect(controller).to.be.instanceOf(Controller);
        expect(controller).to.have.property('app', instance);
    }

    afterEach(function () {
        if (instance && !instance.destroyed) {
            instance.destroy();
        }

        Config.appRoot = instance = null;
    });

    describe('instantiation', function () {
        beforeEach(function () {
            instance = new Application();
        });

        it('should be an application', function () {
            expect(instance).to.have.property('isApplication', true);
        });
    });

    describe('dtor', function () {
        beforeEach(function () {
            instance = new Application();
        });

        it('should clear controllers', function () {
            instance = new Application();

            const controller = new Controller();

            instance.controllers = [
                controller
            ];

            expect(instance).to.have.property('controllers');

            expect(instance.controllers).to.be.an('array');
            expect(instance.controllers).to.have.lengthOf(1);

            testController(instance.controllers[0]);

            instance.controllers = null;

            expect(instance).to.have.property('controllers', null);
            expect(controller).to.have.property('destroyed', true);
        });
    });

    describe('controllers', function () {
        describe('get', function () {
            beforeEach(function () {
                instance = new Application();
            });

            it('should get controllers', function () {
                instance.controllers = [
                    new Controller(),
                    new Controller()
                ];

                expect(instance).to.have.property('controllers');

                expect(instance.controllers).to.be.an('array');
                expect(instance.controllers).to.have.lengthOf(2);

                testController(instance.controllers[0]);
                testController(instance.controllers[1]);
            });
        });

        describe('set', function () {
            it('should set controllers with a string', function () {
                Config.appRoot = this.getAppRoot();

                instance = new Application();

                instance.controllers = [
                    'Test'
                ];

                expect(instance).to.have.property('controllers');

                expect(instance.controllers).to.be.an('array');
                expect(instance.controllers).to.have.lengthOf(1);

                testController(instance.controllers[0]);
            });

            it('should set controllers with instances', function () {
                instance = new Application();

                instance.controllers = [
                    new Controller(),
                    new Controller()
                ];

                expect(instance).to.have.property('controllers');

                expect(instance.controllers).to.be.an('array');
                expect(instance.controllers).to.have.lengthOf(2);

                testController(instance.controllers[0]);
                testController(instance.controllers[1]);
            });

            it('should set controllers with class definitions', function () {
                instance = new Application();

                instance.controllers = [
                    Controller,
                    Controller,
                    Controller
                ];

                expect(instance).to.have.property('controllers');

                expect(instance.controllers).to.be.an('array');
                expect(instance.controllers).to.have.lengthOf(3);

                testController(instance.controllers[0]);
                testController(instance.controllers[1]);
                testController(instance.controllers[2]);
            });

            it('should set controllers during instantiation', function () {
                instance = new Application({
                    controllers : [
                        Controller,
                        Controller,
                        Controller
                    ]
                });

                expect(instance).to.have.property('controllers');

                expect(instance.controllers).to.be.an('array');
                expect(instance.controllers).to.have.lengthOf(3);

                testController(instance.controllers[0]);
                testController(instance.controllers[1]);
                testController(instance.controllers[2]);
            });

            it('should clear controllers', function () {
                instance = new Application();

                const controller = new Controller();

                instance.controllers = [
                    controller
                ];

                expect(instance).to.have.property('controllers');

                expect(instance.controllers).to.be.an('array');
                expect(instance.controllers).to.have.lengthOf(1);

                testController(instance.controllers[0]);

                instance.controllers = null;

                expect(instance).to.have.property('controllers', null);
                expect(controller).to.have.property('destroyed', true);
            });

            it('should clear controllers even if there are now controllers', function () {
                instance = new Application();

                expect(instance).to.have.property('controllers', undefined);

                instance.controllers = null;

                expect(instance).to.have.property('controllers', undefined);
            });
        })
    });
});
