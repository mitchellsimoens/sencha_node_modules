const path      = require('path');

const {
    step : { ssh : { SSHRunner } },
    util : { Config, Logger }
} = require('../');

class QA {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const {
                info : {
                    args
                }
            } = runner;
            const { qa } = args;

            if (qa && qa !== true) {
                const ssh                      = Config.get('qa');
                const stagedPath               = this.getStagePath(args);
                const destinationPath          = this.getDestinationPath(args);
                const { extract, extractDest } = this.getExtractInfo(args);

                new SSHRunner({
                    destinationPath,
                    extract,
                    extractDest,
                    file : args.path,
                    ssh,
                    stagedPath
                })
                    .execute(runner)
                    .then(resolve, reject);
            } else {
                Logger.info('Skipping QA deployment');

                resolve();
            }
        });
    }

    getStagePath (args) {
        return args[ 'qa-stage' ] || args.qa;
    }

    getDestinationPath (args) {
        return path.resolve(args.qa, this.getDate());
    }

    getExtractInfo (args) {
        const extract = args[ 'qa-extract' ];

        if (extract) {
            if (args[ 'qa-extract-destination' ]) {
                return {
                    extract,
                    extractDest : path.resolve(args[ 'qa-extract-destination' ], this.getDate())
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

    getDate (date = new Date()) {
        return date
            .toISOString()
            .substr(0, 10)
            .replace(/-/g, '');
    }
}

module.exports = QA;
