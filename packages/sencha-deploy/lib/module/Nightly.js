const {
    module : { Base },
    step   : {
        CheckProductExistence,
        CheckUpdate,
        GetProduct,
        HashFile,
        PruneNightly,
        QA,
        SaveToDatabase,
        SaveToStorage,
        ValidateArguments
    },
    util   : { Runner }
} = require('../');

class NightlyModule extends Base {
    run (info) {
        const runner = new Runner();

        runner.add(
            new CheckUpdate(),
            new ValidateArguments(),
            this.mergeModuleConfig.bind(this, 'nightly', info),
            this.logInfo.bind(this, info),
            new GetProduct(),
            new HashFile(),
            new CheckProductExistence(),
            new SaveToStorage(),
            new SaveToDatabase(),
            new PruneNightly(),
            new QA()
        );

        return runner.begin(info);
    }
}

module.exports = NightlyModule;
