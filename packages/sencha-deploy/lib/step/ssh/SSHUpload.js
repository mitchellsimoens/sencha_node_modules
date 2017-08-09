const {
    step     : { ssh : { SSHBase } },
    transfer : { SCP2 },
    util     : { Logger }
} = require('../../');

class SSHUpload extends SSHBase {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const {
                config : {
                    ssh, stagedPath
                }
            } = this;
            const {
                info : {
                    args : {
                        path
                    }
                }
            } = runner;
            const instance = new SCP2(ssh);

            Logger.info('Starting file upload to:', stagedPath);

            instance
                .upload(
                    path,
                    stagedPath
                )
                .then(resolve, reject);
        });
    }
}

module.exports = SSHUpload;
