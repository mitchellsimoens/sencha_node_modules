# sencha-jira

A module to work with the [Jira](https://www.atlassian.com/software/jira) [API](https://docs.atlassian.com/jira/REST/latest/).

## Configuration

In order to use Jira, you must have the host url, username and password. Once you have these, you can create an instance of the
`Jira` class:

    const { Jira } = require('@extjs/sencha-jira');

    let jira = new Jira({
        host     : 'myname.jira.com',
        username : 'myusername',
        password : 'mypassword'
    });

## Getting an Issue

To retrieve a single issue, you can pass the issue key to the `get` method:

    jira.get('PROJ-1234')
        .then(fn, fn);

## Searching for Issues

You can pass the JQL to the `search` method to search for issues:

    jira.search('project=PROJ')
        .then(fn, fn);
