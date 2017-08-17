const { Application }               = require('@extjs/sencha-application');
const { feature : { Expressable } } = require('@extjs/sencha-expressjs');

const Server = require('./Server');

class App extends Application {
    static get meta () {
        return {
            mixins : [
                Expressable
            ],

            prototype : {
                config : {
                    server : {
                        xclass : Server
                    }
                }
            }
        };
    }
}

module.exports = App;
