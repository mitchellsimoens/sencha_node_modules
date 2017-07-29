const aws = require('aws-sdk');

const {
    Base
} = require('@extjs/sencha-core');

/**
 * @class Sencha.aws.Base
 */
class AWS extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} isAWS
                 */
                isAWS : true
            }
        };
    }

    static get config () {
        return this._config;
    }

    static set config (config) {
        if (config) {
            aws.config.update(config);
        }

        this._config = config;
    }
}

module.exports = AWS;
