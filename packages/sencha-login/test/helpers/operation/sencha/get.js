const { Base } = require('@extjs/sencha-core');

class SenchaGet extends Base {
    save () {
        return new Promise(resolve => {
            resolve('senchaget');
        });
    }
};

module.exports = SenchaGet;
