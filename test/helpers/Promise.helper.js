const { expect } = require('chai');

before(function () {
    this.$helper(null, {
        expectRejected (promise) {
            expect(promise).to.be.a('promise');

            return promise
                .catch(error => {
                    expect(true).to.be.true;

                    throw error;
                })
                .then(ret => {
                    expect(false).to.be.true;

                    return ret;
                });
        },

        expectResolved (promise) {
            expect(promise).to.be.a('promise');

            return promise
                .then(ret => {
                    expect(true).to.be.true;

                    return ret;
                })
                .catch(error => {
                    expect(false).to.be.true;

                    throw error;
                });
        }
    });
});
