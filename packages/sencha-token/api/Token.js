const { Base, Config } = require('@extjs/sencha-core');
const Manager  = require('../Manager');

class Token extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} [isApiToken=true]
                 */
                isApiToken : true
            }
        };
    }

    static getToken (info) {
        const tokenGetter = Manager.instantiateOperation('api.token.get', Config.get('operation.api.token'));

        return tokenGetter
            .get(info)
            .then(tokens => {
                if (Array.isArray(tokens) && tokens.length) {
                    return tokenGetter.singularize(tokens);
                }

                return tokens;
            });
    }

    static createToken (info) {
        const tokenCreater = Manager.instantiateOperation('api.token.create', Config.get('operation.api.token'));

        return tokenCreater.create(info);
    }

    static deleteToken (info) {
        const tokenDeleter = Manager.instantiateOperation('api.token.delete', Config.get('operation.api.token'));

        return tokenDeleter.delete(info);
    }
}

module.exports = Token;
