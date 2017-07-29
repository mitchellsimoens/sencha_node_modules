const {
    Base, Config
} = require('@extjs/sencha-core');

const path = require('path');

/**
 * @class Sencha.application.Application
 * @extends Sencha.core.Base
 *
 * A class to start a MVC application.
 */
class Application extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isApplication
                 */
                isApplication : true
            }
        };
    }

    dtor () {
        this.controllers = null;
    }

    /**
     * @cfg {Sencha.application.Controller[]/String[]} controllers An array of controller classes.
     * String items will be a path that will be required and instantiated.
     */
    get controllers () {
        return this._controllers;
    }

    set controllers (controllers) {
        if (controllers) {
            this._controllers = controllers.map((controller) => {
                if (typeof controller === 'string') {
                    const {
                        appRoot
                    } = Config;

                    controller = require(path.join(appRoot, 'controller', controller)); // eslint-disable-line global-require
                }

                if (controller.isController) {
                    controller.app = this;
                } else {
                    controller = new controller({ // eslint-disable-line new-cap
                        app : this
                    });
                }

                return controller;
            });
        } else {
            controllers = this._controllers;

            if (controllers) {
                controllers.forEach(controller => controller.destroy());

                this._controllers = null;
            }
        }
    }
}

Application.decorate();

module.exports = Application;
