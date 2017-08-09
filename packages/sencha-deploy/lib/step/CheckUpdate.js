const { util : { Config, Update } } = require('../');

class CheckUpdate {
    execute () {
        const updater = new Update(Config.config);

        return updater.checkIfOutdated();
    }
}

module.exports = CheckUpdate;
