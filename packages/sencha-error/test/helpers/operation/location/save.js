const { Base } = require('@extjs/sencha-core');

class LocationSave extends Base {
    save () {
        return new Promise(resolve => {
            resolve('locationsave');
        });
    }
}

module.exports = LocationSave;
