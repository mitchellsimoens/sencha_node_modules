const { Application } = require('@extjs/sencha-application');

const Server = require('./Server');

class App extends Application {
    static get meta () {
        return {
            mixins : [
                '@extjs/sencha-expressjs/feature/Expressable'
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
