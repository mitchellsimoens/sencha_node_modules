const {
    error : { FatalError },
    util  : { Logger }
} = require('../');

class GetProduct {
    execute (runner) {
        return new Promise((resolve, reject) => {
            const { info } = runner;
            const {
                app  : { database },
                args : { product }
            } = info;
            Logger.info('Retreiving product from database...');

            database
                .query(
                    'SELECT * FROM product WHERE code = ?;',
                    [
                        product
                    ]
                )
                .then(product => {
                    if (Array.isArray(product)) {
                        [ product ] = product;
                    }

                    if (product) {
                        Logger.info('Retrieved product from database.');

                        info.product = product;

                        resolve();
                    } else {
                        reject(new FatalError('Product is not found.'));
                    }
                })
                .catch(reject);
        });
    }
}

module.exports = GetProduct;
