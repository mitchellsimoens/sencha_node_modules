const {
    step     : { ssh : { SSHBase } },
    transfer : { SSH },
    util     : { Logger }
} = require('../../');

class SSHPrepare extends SSHBase {
    execute () {
        return new Promise((resolve, reject) => {
            const instance = new SSH(this.config.ssh);
            const commands = this.buildCommands();

            Logger.info('Preparing SSH...');

            instance
                .execCommand(commands)
                .then(resolve, reject);
        });
    }

    buildCommands () {
        const { config : {
            destinationPath,
            extract,
            extractDest,
            stagedPath
        } } = this;
        const commands = [
            `umask 022`,
            `mkdir -p -m 755 ${stagedPath}`,
            `mkdir -p -m 755 ${destinationPath}`
        ];

        if (typeof extract === 'string') {
            commands.push(`mkdir -p -m 755 ${extract}`);

            if (extractDest) {
                commands.push(`mkdir -p -m 755 ${extractDest}`);
            }
        }

        return commands.join('; ');
    }
}

module.exports = SSHPrepare;
