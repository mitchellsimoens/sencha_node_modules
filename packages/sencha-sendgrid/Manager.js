const { Base, Managerable } = require('@extjs/sencha-core');

const Endpoint = require('./Endpoint');

/**
 * @class Sencha.rest.Manager
 * @extends Sencha.core.Base
 * @singleton
 */
class Manager extends Base {
    static get meta () {
        return {
            mixins : [
                Managerable
            ],

            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} [isRestManager=true]
                 */
                isRestManager : true
            }
        };
    }

    static get baseInstance () {
        return {
            cls      : Endpoint,
            property : 'isRestEndpoint'
        };
    }

    handle (req) {
        const { url }    = req;
        const endpoints  = this.get();
        const recognized = [];

        for (const name in endpoints) {
            const endpoint = endpoints[ name ];

            if (endpoint.recognize(url)) {
                recognized.push(endpoint);
            }
        }

        return Promise.all(
            recognized.map(endpoint => endpoint.dispatch(req))
        );
    }
}

module.exports = new Manager();
