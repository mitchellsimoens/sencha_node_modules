const {
    step : {
        ssh : { SSHBase, SSHExtract, SSHPrepare, SSHUpload }
    },
    util : { Logger, Runner }
} = require('../../');

class SSHRunner extends SSHBase {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const {
                info : { app, args, file, moduleCfg }
            } = runner;

            const subRunner = new Runner();

            Logger.info('Starting SSH steps...');

            subRunner
                .add(
                    this.prepare(),
                    this.upload(),
                    this.extract()
                )
                .begin({
                    app,
                    args,
                    file,
                    moduleCfg
                })
                .then(resolve, reject);
        });
    }

    prepare (config = this.config) {
        return new SSHPrepare(config);
    }

    upload (config = this.config) {
        return new SSHUpload(config);
    }

    extract (config = this.config) {
        return new SSHExtract(config);
    }
}

module.exports = SSHRunner;
