# sencha-email

This module allows for sending emails to a provider. This module does not specify any providers but provides the classes needed to
prepare an email with a common API that is sent to a specific provider.

An example provider is the [Sendgrid](https://mitchell.io/sencha/sencha-sendgrid) provider.

## Add a Provider

The `Manager` class has an `add` method that can accept a name and provider as arguments:

    const { Manager } = require('@extjs/sencha-email');

    Manager.add(foo, provider);

Or you can pass an object to add multiple providers at once:

    const { Manager } = require('@extjs/sencha-email');

    Manager.add({
        bar : barProvider,
        foo : fooProvider
    });

## Send an Email

The `Email` class has a common API that can be used by the connected providers. To send an email, instantiate the `Email` class
and execute it's `send` method passing which provider to send with:

    const { Email } = require('@extjs/sencha-email');

    let email = new Email({
        provider : 'foo',

        from    : 'foo@bar.com',
        to      : 'bar@foo.com',
        subject : 'Test Email',
        body    : 'This is a test email'
    });

    email
        .send()
        .then(fn, fn);

Optionally, you can omit the `provider` config from the `Email` class but then you need to pass it to the `send` method:

    const { Email } = require('@extjs/sencha-email');

    let email = new Email({
        from    : 'foo@bar.com',
        to      : 'bar@foo.com',
        subject : 'Test Email',
        body    : 'This is a test email'
    });

    email
        .send('foo')
        .then(fn, fn);

The values for `from` and `to` can be a mixed value, this depends on the provider that is going to be used.

By default, the `body` config specified as a String is meant to send the email as HTML. If you want to send both HTML and plain text,
you can specify an object for the body:

    const { Email } = require('@extjs/sencha-email');

    let email = new Email({
        provider : 'foo',

        from    : 'foo@bar.com',
        to      : 'bar@foo.com',
        subject : 'Test Email',
        body    : {
            html : '<h1>Test Email</h1>',
            text : 'Test Email
        }
    });

    email
        .send()
        .then(fn, fn);
