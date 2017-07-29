const { Base } = require('@extjs/sencha-core');

class UnknownSave extends Base {
    save () {
        return new Promise(resolve => {
            resolve('unknownsave');
        });
    }
}

module.exports = UnknownSave;
