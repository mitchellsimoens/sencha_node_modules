const { Connection, Manager } = require('@extjs/sencha-mysql');

module.exports = {
    forum () {
        let connection = Manager.get('forum');

        if (!connection) {
            connection = new Connection({
                database : '',
                host     : '',
                password : '',
                user     : '',
                usePool  : false
            });

            Manager.add('forum', connection);
        }

        return connection;
    },

    login () {
        let connection = Manager.get('login');

        if (!connection) {
            connection = new Connection({
                database : '',
                host     : '',
                password : '',
                user     : '',
                usePool  : false
            });

            Manager.add('login', connection);
        }

        return connection;
    },

    sencha () {
        let connection = Manager.get('sencha');

        if (!connection) {
            connection = new Connection({
                database : '',
                host     : '',
                password : '',
                user     : '',
                usePool  : false
            });

            Manager.add('sencha', connection);
        }

        return connection;
    }
};
