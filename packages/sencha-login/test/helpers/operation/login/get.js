const { Base } = require('@extjs/sencha-core');

class LoginGet extends Base {
    save () {
        return new Promise(resolve => {
            resolve('loginget');
        });
    }
};

module.exports = LoginGet;
