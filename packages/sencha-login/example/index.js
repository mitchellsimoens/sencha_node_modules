const { Adapter, Manager } = require('../');
const { Batch }            = require('@extjs/sencha-mysql');

const rootPath = __dirname;

class MyAdapter extends Adapter {
    static get meta () {
        return {
            prototype : {
                rootPath
            }
        };
    }

    createBatch () {
        return new Batch();
    }
}

Manager.adapter = new MyAdapter();

// require('./forum');
require('./login');
// require('./sencha');

