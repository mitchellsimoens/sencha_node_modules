const scp2 = require('scp2');

const {
    transfer : { Base },
    util     : { Progress }
} = require('../');

const endingSlash = /\/$/;

class SCP extends Base {
    constructor (config) {
        super(config);

        this.progress = new Progress({
            showComplete       : false,
            showUniqueProgress : true
        });
    }

    upload (source = this.config.source, destination = this.config.destination) {
        return new Promise((resolve, reject) => {
            const config = Object.assign({}, this.config);
            const client = new scp2.Client();

            client.on('transfer', this.onTransfer.bind(this));

            scp2.scp(
                source,
                {
                    host       : config.server,
                    path       : endingSlash.test(destination) ? destination : `${destination}/`,
                    privateKey : config.key,
                    username   : config.user
                },
                client,
                (error) => {
                    this.onTransfer(null, 1, 1);

                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    onTransfer (buffer, uploaded, total) {
        this.progress.update(uploaded / total);
    }
}

module.exports = SCP;
