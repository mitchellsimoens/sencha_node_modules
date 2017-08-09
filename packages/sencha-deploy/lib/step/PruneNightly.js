const {
    step : { nightly : { GetOldNightlies, RemoveFromDatabase, RemoveFromStorage } },
    util : { Runner }
} = require('../');

class PruneNightly {
    execute (runner) {
        const subRunner = new Runner();
        const {
            info : { app, moduleCfg, product }
        } = runner;

        return subRunner
            .add(
                new GetOldNightlies(),
                new RemoveFromStorage(),
                new RemoveFromDatabase()
            )
            .begin({
                app,
                moduleCfg,
                product
            });
    }
}

module.exports = PruneNightly;
