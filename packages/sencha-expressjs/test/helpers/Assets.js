const path = require('path');

module.exports = {
    getAssetDir () {
        return path.join(__dirname, 'assets');
    },

    getAssetLocation (loc, relative) {
        loc = path.join(this.getAssetDir(), loc);

        if (relative) {
            loc = loc.replace(relative, '');
        }

        return loc;
    }
};
