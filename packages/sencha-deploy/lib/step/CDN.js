const {
    step : { ssh : { SSHRunner } },
    util : { Config, Logger }
} = require('../');

class CDN {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const {
                info : {
                    args
                }
            } = runner;
            const { cdn } = args;

            if (cdn && cdn !== true) {
                let ssh                      = Config.get('cdn'),
                    stagedPath               = this.getStagePath(args),
                    destinationPath          = this.getDestinationPath(args),
                    { extract, extractDest } = this.getExtractInfo(args);

                new SSHRunner({
                        stagedPath,
                        destinationPath,
                        extract,
                        extractDest,
                        ssh,
                        file : args.path
                    })
                    .execute(runner)
                    .then(resolve, reject);
            } else {
                Logger.info('Skipping CDN deployment');

                resolve();
            }
        });
    }

    getStagePath (args) {
        return args['cdn-stage'] || args.cdn;
    }

    getDestinationPath (args) {
        return args.cdn;
    }

    getExtractInfo (args) {
        const extract = args['cdn-extract'];

        if (extract) {
            if (args['cdn-extract-destination']) {
                return {
                    extract,
                    extractDest : args['cdn-extract-destination']
                };
            } else {
                return {
                    extract
                };
            }
        } else {
            return {
                extract : false
            };
        }
    }
}

module.exports = CDN;
