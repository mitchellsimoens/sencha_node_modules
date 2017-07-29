# sencha-salesforce

A small module to manage connections to Salesforce and provides a simple API for sending a call to Salesforce.

## Connections

The `Manager` class can manage multiple `Connection` classes allowing for sandboxed endpoints. Each `Connection` is
given a name which can then be used to query or invoke calls on. To add connections to the `Manager`, you will use
the `add` method:

    const { Manager } = require('@extjs/sencha-salesforce');

    Manager.add('foo', {
        password    : 'foo',
        token       : 'bar',
        username    : 'foo@bar.com',
        endpointUrl : 'https://ab12.salesforce.com/services/Soap/class/SomeService',
        xmlns       : 'http://soap.sforce.com/schemas/class/SomeService'
    });

You can also add multiple by passing an Object to the `add` method:

    const { Manager } = require('@extjs/sencha-salesforce');

    Manager.add({
        bar : {
            password    : 'bar',
            token       : 'baz',
            username    : 'bar@baz.com',
            endpointUrl : 'https://cd34.salesforce.com/services/Soap/class/SomeService',
            xmlns       : 'http://soap.sforce.com/schemas/class/SomeService'
        },
        foo : {
            password    : 'foo',
            token       : 'bar',
            username    : 'foo@bar.com',
            endpointUrl : 'https://ab12.salesforce.com/services/Soap/class/SomeService',
            xmlns       : 'http://soap.sforce.com/schemas/class/SomeService'
        }
    });

## Querying using SOQL

To query using Salesforce Object Query Language (SOQL), you will use the `query` method on the `Manager` passing in what
connection you want to query and the SOQL:

    const { Manager } = require('@extjs/sencha-salesforce');

    Manager.query(
        'foo',
        'field1 = > 1'
    );

The `query` method returns a promise which will resolve with the matches or reject with an error.

## Invoking a SOAP call

You can also invoke a SOAP call to a service on Salesforce using the `invoke` method:

    const { Manager } = require('@extjs/sencha-salesforce');

    Manager.invoke(
        'foo',
        'someMethod',
        {
            foo : 'bar'
        }
    );

Like the `query` method, the `invoke` method returns a promise which will resolve or reject depending on the response.
