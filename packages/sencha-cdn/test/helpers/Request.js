module.exports = {
    createRequest ({ error, body }) {
        return {
            post (options, callback) {
                callback(error, null, body);
            }
        };
    }
};
