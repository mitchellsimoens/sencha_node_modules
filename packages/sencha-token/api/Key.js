const { Base, Config } = require('@extjs/sencha-core');
const Manager  = require('../Manager');

class Key extends Base {
    static get meta () {
        return {
            prototype : {
                /**
                 * @readonly
                 * @property {Boolean} [isApiKey=true]
                 */
                isApiKey : true
            }
        };
    }

    static getKey (info) {
        const keyGetter = Manager.instantiateOperation('api.key.get', Config.get('operation.api.token'));

        return keyGetter
            .get(info)
            .then(keys => {
                if (Array.isArray(keys) && keys.length) {
                    return keyGetter.singularize(keys);
                }

                return keys;
            });
    }
}

module.exports = Key;
