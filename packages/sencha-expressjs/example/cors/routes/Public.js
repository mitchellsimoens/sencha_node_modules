const { route : { Route }, Response } = require('@extjs/sencha-expressjs');

class Public extends Route {
    static get meta () {
        return {
            prototype : {
                config : {
                    method : 'GET'
                }
            }
        };
    }

    handle (req, res) {
        return new Promise((resolve, reject) => {
            resolve({
                success : true
            });
        });
    }
}

module.exports = Public;
