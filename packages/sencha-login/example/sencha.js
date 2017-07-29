const { Batch }  = require('@extjs/sencha-mysql');
const { Sencha } = require('../');

const connection = require('./db').sencha();

// load user by uid or email
Sencha
    .load({
        connection,
        batch : new Batch(),
        uid   : 1234,
        email : 'me@me.com'
    })
    .then(console.log, console.log);

// check password by uid or email
/*Sencha
    .checkPassword({
        connection,
        batch    : new Batch(),
        uid      : 1234,
        email    : 'me@me.com',
        password : 'mypassword'
    })
    .then(console.log, console.log);*/

// save user by uid
/*Sencha
    .load({
        connection,
        batch : new Batch(),
        uid   : 1234
    })
    .then(instance => {
        instance.data.auth_data = 'myforumuser';
        return instance;
    })
    .then(instance => instance.save({
        connection,
        batch : new Batch()
    }))
    .then(console.log, console.log);*/
