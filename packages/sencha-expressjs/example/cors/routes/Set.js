const { route : { Route }, Response } = require('@extjs/sencha-expressjs');

class Public extends Route {
    static get meta () {
        return {
            prototype : {
                config : {
                    method : 'POST'
                }
            }
        };
    }

    handle (req, res) {
        return new Promise((resolve, reject) => {
            res.cookie('foo', 'bar');

            resolve({
                success : true
            });
        });
    }
}

module.exports = Public;
