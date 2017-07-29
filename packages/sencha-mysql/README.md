sencha-mysql
===

The purpose of this module is to manage MySQL connections and queries. The parts of this module include a
Manager class along with Batch, Connection and Query classes. The Manager class is what will be used, the
other three likely will not be used publicly.

Add a connection
---

The Manager class can contain a single MySQL connection or multiple connections. To add a connection, you will
need to name the connection and pass it to the Manager class:

    const { Manager } = require('@extjs/sencha-mysql');

    Manager.add('foo', {
        host     : 'foo.com',
        user     : 'foo',
        password : 'foobar'
    });

You can also add multiple in one call:

    const { Manager } = require('@extjs/sencha-mysql');

    Manager.add({
        foo : {
            host     : 'foo.com',
            user     : 'foo',
            password : 'foobar'
        },
        bar : {
            host     : 'bar.com',
            user     : 'bar',
            password : 'barbaz'
        }
    });

Querying a connection
---

To query a connection, you can pass what connection to query and the sqls and insert params for the query:

    const { Manager } = require('@extjs/sencha-mysql');

    Manager
        .query(
            'foo',
            'SELECT 1;'
        );

    Manager
        .query(
            'bar',
            'UPDATE foo SET ?;',
            [
                { foo : 'bar' }
            ]
        );

    Manager
        .query(
            'bar',
            [
                'UPDATE foo SET ? WHERE id = ?;',
                'SELECT * FROM foo WHERE id = ?;
            ],
            [
                { foo : 'bar' },
                1,
                1
            ]
        );

Notice the second parameter can either be a string or an array of strings. The insert params should be an array
and will be applied onto the sql statements. For more, please see the [mysql](https://www.npmjs.com/package/mysql) module.

Handling query results
---

The `query` method returns a `Promise` that will either resolve with results from **ALL** the sqls statements or reject
with an error:

    const { Manager } = require('@extjs/sencha-mysql');

    Manager
        .query(
            'bar',
            [
                'UPDATE foo SET ? WHERE id = ?;',
                'SELECT * FROM foo WHERE id = ?;
            ],
            [
                { foo : 'bar' },
                1,
                1
            ]
        )
        .then(
            function(results) {
                let updateResult  = results[0],
                    selectResults = results[1];
            },
            function(error) {
                //will be an instance of Error
                console.log(erorr.message);
            }
        );

Batching queries
---

One of the unique features of the Connection class is that it can be suspended. This means that no matter
how many queries are executed, the database won't get hit with the queries until the connection is resumed.
Each query will not resolve until the batch has been resolved. This could mean better performance.

    const { Manager } = require('@extjs/sencha-mysql');

    Manager.suspend('foo');

    Manager
        .query(
            'foo',
            'SELECT 1;'
        );

    Manager
        .query(
            'foo',
            'SELECT 1;'
        );

    Manager.resume('foo');

The actual query to the database will not occur until that `resume` method is called. The two sql statements
from each `query` call are then concatenated and that ending sql statement is then sent as a single query to
the database.
