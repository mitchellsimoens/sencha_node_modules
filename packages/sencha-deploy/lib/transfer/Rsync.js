const { Base } = require('./');
const rsync    = require('rsync');

class Rsync extends Base {
    constructor (config) {
        super(config);

        this.config = Object.assign(
            {
                flags : 'z',
                shell : 'ssh'
            },
            this.config
        );
    }

    upload (source = this.config.source, destination = this.config.destination) {
        return new Promise((resolve, reject) => {
            const { config } = this;
            const instance   = new rsync() // eslint-disable-line new-cap
                .shell(config.shell)
                .flags(config.flags)
                .source(source)
                .destination(`${config.user}@${config.server}:${destination}`);

            if (config.key) {
                instance.set('-e', `ssh -i ${config.key}`);
            }

            instance.execute((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = Rsync;
