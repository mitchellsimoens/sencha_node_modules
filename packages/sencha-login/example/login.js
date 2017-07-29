const db        = require('./db');
const { Login } = require('../');

require('./config');
require('./token');

const login = new Login({
    login      : 'sencha',
    connection : {
        forum   : db.forum(),
        login   : db.login(),
        sencha  : db.sencha()
    },
    cookies    : {
        //bb_password : '39110ec958b886b3de212ea52c631597',
        //bb_userid   : 22216,

        //sencha_api_refresh_token : 'ed1cbdf8aebd4e936776aef8bbb3c87f42d01b39',

        sencha_forum_api_refresh_token : '57320c066dc539e823a91a4b0280a87f51356ae1'
    }
});

login
    .check()
    .then(ret => {
        console.log('*** end');
        console.log(ret);
    })
    .catch(error => {
        console.log('*** error');
        console.log(error);
    });
