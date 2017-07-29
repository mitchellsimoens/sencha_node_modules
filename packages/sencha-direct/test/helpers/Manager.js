const { Manager } = require('./../../');

module.exports = {
    createManagerListener (fn) {
        Manager.on({
            directaction : fn,
            single       : true,
            scope        : Manager
        });
    },

    createManagerReject () {
        this.createManagerListener(event => {
            event.reject(new Error('something happened'));
        });
    },

    createManagerResolve () {
        this.createManagerListener(event => {
            event.resolve({
                success : true,
                msg     : 'hello'
            });
        });
    }
};
