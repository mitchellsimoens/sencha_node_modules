const { route : { Express }, Directable } = require('../../../');
const { Config } = require('@extjs/sencha-core');

class Api extends Express {
    static get meta () {
        return {
            mixins : [
                Directable
            ],

            prototype : {
                apiVariable : 'window.REMOTING_API'
            }
        };
    }

    ctor () {
        this.direct = Config.get('server.direct');
    }
}

module.exports = Api;
