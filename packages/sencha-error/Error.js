const { Base }  = require('@extjs/sencha-core');
const { Manager, combiner : { Error : ErrorCombiner } } = require('./');

class ErrorCls extends Base {
    static get meta () {
        return {
            prototype : {
                isError : true
            }
        };
    }

    save (info) {
        return new Promise((resolve, reject) => {
            if (info) {
                const { batch, connection } = info;
                const errorCombiner         = new ErrorCombiner();
                const env                   = Manager.instantiateOperation('env.save');
                const error                 = Manager.instantiateOperation('error.save');
                const location              = Manager.instantiateOperation('location.save');

                errorCombiner.add('error',    error   .save(this, batch)); // eslint-disable-line no-whitespace-before-property
                errorCombiner.add('env',      env     .save(this, batch)); // eslint-disable-line no-whitespace-before-property
                errorCombiner.add('location', location.save(this, batch));

                errorCombiner
                    .then(() => this)
                    .then(resolve, reject);

                if (connection) {
                    connection.exec(batch);
                }
            } else {
                reject(new Error('No info to save with'));
            }
        });
    }
}

module.exports = ErrorCls;
