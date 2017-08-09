const {
    module : { Base },
    step   : {
        CDN,
        CheckProductExistence,
        CheckUpdate,
        GetProduct,
        HashFile,
        SaveToDatabase,
        SaveToStorage,
        ValidateArguments
    },
    util   : { Runner }
} = require('../');

class ReleaseModule extends Base {
    run (info) {
        const runner = new Runner();

        runner.add(
            new CheckUpdate(),
            new ValidateArguments(),
            this.mergeModuleConfig.bind(this, 'release', info),
            this.logInfo.bind(this, info),
            new GetProduct(),
            new HashFile(),
            new CheckProductExistence(),
            new SaveToStorage(),
            new SaveToDatabase(),
            new CDN()
        );

        return runner.begin(info);
    }
}

module.exports = ReleaseModule;
