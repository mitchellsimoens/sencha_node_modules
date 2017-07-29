const { Base } = require('@extjs/sencha-core');

class EnvSave extends Base {
    save () {
        return new Promise(resolve => {
            resolve('envsave');
        });
    }
}

module.exports = EnvSave;
