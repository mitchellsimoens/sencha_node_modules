const db = require('./db');

const { Manager } = require('@extjs/sencha-token');
const { Adapter } = require('@extjs/sencha-token-mysql');

Manager.adapter = new Adapter({
    db : db.login()
});
