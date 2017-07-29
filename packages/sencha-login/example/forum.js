const { Batch } = require('@extjs/sencha-mysql');
const { Forum } = require('../');

const connection = require('./db').forum();

// load user by userid or email
Forum
    .load({
        connection,
        batch    : new Batch(),
        //userid   : 1234,
        //username : 'abc',
        email    : 'me@me.com'
    })
    .then(console.log, console.log);

// check password by userid or email
/*Forum
    .checkPassword({
        connection,
        batch    : new Batch(),
        userid   : 1234,
        username : 'abc',
        email    : 'me@me.com',
        password : 'mypassword'
    })
    .then(console.log, console.log);*/

// save user by userid
/*Forum
    .load({
        connection,
        batch  : new Batch(),
        userid : 1234
    })
    .then(instance => {
        instance.data.email = 'you@you.com';
        return instance;
    })
    .then(instance => instance.save({
        connection,
        batch : new Batch()
    }))
    .then(console.log, console.log);*/
