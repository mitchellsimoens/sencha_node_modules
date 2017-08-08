const { Config }                  = require('@extjs/sencha-core');
const { route : { SimpleRoute } } = require('@extjs/sencha-expressjs');

class Index extends SimpleRoute {
    constructor (config = {}) {
        config.dir = Config.get('extjs.dir');

        super(config);
    }
}

module.exports = Index;
