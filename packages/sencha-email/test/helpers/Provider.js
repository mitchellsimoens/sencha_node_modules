const { Provider } = require('../../');

module.exports = {
    createProvider ({ sendSpy, sendError, sendResult }) {
        class MyProvider extends Provider {
            send (...args) {
                if (sendSpy) {
                    sendSpy(...args);
                }

                return new Promise((resolve, reject) => {
                    if (sendError) {
                        reject(sendError);
                    } else {
                        resolve(sendResult);
                    }
                });
            }
        }

        return new MyProvider();
    }
};
