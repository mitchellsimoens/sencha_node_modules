const { route : { SimpleRoute } } = require('@extjs/sencha-expressjs');

class Public extends SimpleRoute {
    static get meta () {
        return {
            prototype : {
                config : {
                    dir : 'public'
                }
            }
        };
    }
}

module.exports = Public;
