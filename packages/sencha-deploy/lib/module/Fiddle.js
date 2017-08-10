const {
    module : {
        Base
    },
    step   : {
        fiddle : {
            BuildGroups,
            BuildSQL,
            GetCreator,
            GetPackage
        }
    },
    util   : {
        Runner
    }
} = require('../');

class Fiddle extends Base {
    run (info) {
        const runner = new Runner();

        runner.add(
            new GetPackage(),
            new GetCreator(),
            new BuildGroups(),
            new BuildSQL()
        );

        return runner.begin(info);
    }
}

module.exports = Fiddle;
