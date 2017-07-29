const { Base } = require('@extjs/sencha-core');

class ErrorSave extends Base {
    save () {
        return new Promise(resolve => {
            resolve('errorsave');
        });
    }
}

module.exports = ErrorSave;
