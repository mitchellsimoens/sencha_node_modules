# sencha-token

The purpose of this module is to manage tokens. This is general to handle all kinds of tokens like the
API tokens needed for login.

## Configure an adapter

This module is a general module that has no knowledge of storage of the tokens. The `Manager` class can
be configured with an adapter to allow any class in this module to use the storage. For example, to use the
[mysql](https://gitlab.com/mitchellsimoens/sencha-token-mysql) adapter:

    const { Manager } = require('@extjs/sencha-token');
    const { Adapter } = require('@extjs/sencha-token-mysql');

    Manager.adapter = new Adapter();

## API Tokens

There are three types of API Tokens:

* `access` The actual token that allows the user to do something.
* `code` The token that allows an access token to be generated usually on login.
* `refresh` The token that will allow a new access token to be regenerated when a user is logged in.

The api `Token` class has three static methods to manage all three types of tokens:

* `getToken`
* `createToken`
* `deleteToken`

Each method can accept a single argument that is usually going to be an `Object` and will pass it
to the associated operation. Each method will also return an `Promise` so long as the assocaited operation
returns a `Promise`.
