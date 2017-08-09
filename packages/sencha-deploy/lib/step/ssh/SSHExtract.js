const path = require('path');

const {
    step     : { ssh : { SSHBase } },
    transfer : { SSH },
    util     : { Logger }
} = require('../../');

class SSHExtract extends SSHBase {
    execute () {
        return new Promise((resolve, reject) => {
            const instance = new SSH(this.config.ssh);
            const commands = this.buildCommands();

            Logger.info('Extracting file...');

            instance
                .execCommand(commands)
                .then(resolve, reject);
        });
    }

    buildCommands () {
        const { config }                      = this;
        const { destinationPath, stagedPath } = config;
        const file                            = path.parse(config.file).base;
        const fileResolved                    = path.resolve(stagedPath, file);
        const commands                        = [];

        if (config.extract) {
            /**
             * Need to know if a path was given here or if it is `true`.
             */
            const isExtractString = typeof config.extract === 'string';
            /**
             * If the `extract` argument is a string, it is assumed the zip extracted to a single directory with
             * the source within it. We want to move the inner source to the destination.
             * If `extract` is `true`, then we can just use the staged path.
             */
            const moveSource      = isExtractString ? config.extract                        : stagedPath;
            /**
             * If the `extract` argument is a string, we can see if the `extract-destination` argument was passed.
             * If it was, then we should move the inner source to this path else use the destination path.
             *
             * This is handy if we should have the zip go to one directory and the extracted source to another.
             */
            const moveDest        = isExtractString ? config.extractDest || destinationPath : destinationPath;

            commands.push(
                `unzip ${fileResolved} -d ${stagedPath}`,
                `mv ${path.resolve(moveSource, '*')} ${moveDest}`,
                `chmod -R 755 ${moveDest}`
            );

            if (isExtractString && config.extractDest) {
                /**
                 * Let's move the zip to the destination path.
                 */
                commands.push(`mv ${fileResolved} ${destinationPath}`);
            } else {
                /**
                 * No need to keep the zip in this case.
                 */
                commands.splice(1, 0, `rm -rf ${fileResolved}`);
            }
        } else {
            const destinationResolved = path.resolve(destinationPath, file);

            if (fileResolved === destinationResolved) {
                commands.push(`chmod -R 755 ${destinationPath}`);
            } else {
                commands.push(
                    `mv ${fileResolved} ${destinationResolved}`,
                    `chmod -R 755 ${destinationPath}`
                );
            }
        }

        if (path.normalize(stagedPath) !== path.normalize(destinationPath)) {
            /**
             * Cleanup the staged area so long as it is not the destination path.
             */
            commands.push(`rm -rf ${stagedPath}`);
        }

        return commands.join('; ');
    }
}

module.exports = SSHExtract;
