const { Base } = require('@extjs/sencha-core');

class ForumGet extends Base {
    save () {
        return new Promise(resolve => {
            resolve('forumget');
        });
    }
};

module.exports = ForumGet;
