const {
    module : { Base },
    step   : {
        CDN,
        CheckProductExistence,
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
