const { Logger } = require('./');

class Progress {
    constructor (config) {
        Object.assign(
            this,
            {
                completeToken      : '\u2587',
                incompleteToken    : ' ',
                length             : 50,
                showComplete       : true,
                showUniqueProgress : false
            },
            config
        );
    }

    update (progress) {
        if (this.lastProgress !== progress) {
            const progressRounded = Math.floor(progress * 100);

            this.lastProgress = progress;

            if (this.showUniqueProgress) {
                if (this.lastProgressRounded === progressRounded) {
                    return;
                } else {
                    this.lastProgressRounded = progressRounded;
                }
            }

            const { length } = this;

            const num = Math.floor(length * progress);
            const str = [
                '[',
                ']'
            ];

            for (let i = 0; i < length; i++) {
                const token = i < num ? this.completeToken : this.incompleteToken;

                str.splice(
                    i + 1,
                    0,
                    token
                );
            }

            let msg = progressRounded;

            if (msg < 10) {
                msg = '  ' + msg;
            } else if (msg < 100) {
                msg = ' ' + msg;
            }

            Logger.info(
                'Progress:',
                str.join(''),
                msg,
                '%'
            );

            if (this.showComplete && num >= length) {
                Logger.info('Progress complete');
            }
        }
    }
};

module.exports = Progress;
