const fs   = require('fs');
const path = require('path');

class Base {
    constructor (config = {}) {
        this.config = config;

        config.key = this.parseKey(config.key);
    }

    parseKey (key) {
        if (!key || Buffer.isBuffer(key)) {
            return key;
        } else {
            if (!/^\//.test(key) && process.env.NODE_ENV === 'development') {
                key = path.resolve(__dirname, '../..', key);
            }

            return fs.readFileSync(key);
        }
    }
}

module.exports = Base;
