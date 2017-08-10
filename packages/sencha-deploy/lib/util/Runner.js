const {
    error : { FatalError },
    util  : { Logger }
} = require('../');

class Runner {
    constructor () {
        this.stack = [];
    }

    add (...steps) {
        this.stack = this.stack.concat(steps);

        return this;
    }

    begin (info = {}) {
        return new Promise((resolve, reject) => {
            this.info = info;

            this.run().then(resolve, reject);
        });
    }

    run () {
        return new Promise((resolve, reject) => {
            let { index } = this;

            if (index === undefined) {
                index = 0;
            } else {
                index++;
            }

            const step = this.stack[ index ];

            if (step) {
                const name = step.name || step.constructor.name;
                let   ret;

                Logger.info('Step Started:', name);
                Logger.indent(4);

                step.$perf = process.hrtime();

                if (typeof step === 'function') {
                    ret = step(this, true);
                } else if (step.execute) {
                    ret = step.execute(this);
                }

                this.index = index;

                if (ret instanceof Promise) {
                    ret
                        .then(this.onStepFinish.bind(this, step), this.onStepFinish.bind(this, step))
                        .then(this.run.bind(this), this.onError.bind(this))
                        .then(resolve)
                        .catch(reject);
                } else {
                    this.onStepFinish(step);

                    this.run().then(resolve, reject);
                }
            } else {
                resolve();
            }
        });
    }

    onStepFinish (step, error) {
        const name = step.name || step.constructor.name;

        let diff = process.hrtime(step.$perf),
            unit = 'ms';

        if (step.finish) {
            step.finish(error);
        }

        diff = (diff[ 0 ] * 1e9 + diff[ 1 ]) / 1000000;

        if (diff > 5000) {
            // convert to seconds
            diff = diff / 1000;
            unit = 's';
        }

        delete step.$perf;

        Logger.indent(-4);
        Logger.info('Step Finished:', name, `(${diff} ${unit})`);

        if (error) {
            if (FatalError.isFatal(error)) {
                throw error;
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        }
    }

    onError (e) {
        return new Promise((resolve, reject) => {
            this.undo().then(
                () => reject(e),
                () => reject(e)
            );
        });
    }

    undo () {
        return new Promise((resolve, reject) => {
            const { index } = this;

            if (index < 0) {
                resolve();
            } else {
                const step = this.stack[ index ];

                this.index = index - 1;

                if (step) {
                    let ret;

                    if (step.undo) {
                        ret = step.undo(this);
                    }

                    if (ret instanceof Promise) {
                        ret
                            .then(this.undo.bind(this), this.undo.bind(this))
                            .then(resolve)
                            .catch(reject);
                    } else {
                        this
                            .undo()
                            .then(resolve, reject)
                            .then(resolve)
                            .catch(reject);
                    }
                } else {
                    this.undo().then(resolve, reject);
                }
            }
        });
    }

    addData (key, data) {
        const info = this.$info || (this.$info = {});

        info[ key ] = data;
    }

    getData (key) {
        const info = this.$info || {};

        return info[ key ];
    }
}

module.exports = Runner;
