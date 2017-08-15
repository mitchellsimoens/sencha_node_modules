const { Jira } = require('../');

const instance = new Jira({
    host     : '',
    password : '',
    user     : ''
});

instance.search('text ~ grid').then(console.log, console.log);
