module.exports = {
    cloneFunction (fn, config) {
        const temp = function temporary () {
            return fn.apply(this, arguments);
        };

        for (let key in fn) {
            temp[key] = fn[key];
        }

        if (config) {
            for (let key in config) {
                temp.prototype[key] = config[key];
            }
        }

        return temp;
    }
};
