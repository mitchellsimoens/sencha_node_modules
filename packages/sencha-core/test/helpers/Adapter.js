const {
    Adapter
} = require('../../operation');

module.exports = {
    createAdapter () {
        class MyAdapter extends Adapter {
            static get meta () {
                return {
                    prototype : {
                        rootPath : __dirname
                    }
                };
            }

            get operations () {
                return {
                    'foo.bar' : null
                };
            }
        }

        return new MyAdapter();
    }
};
