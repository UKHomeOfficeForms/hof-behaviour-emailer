# hof-behaviour-emailer
HOF behaviour to send emails

## Usage

```js
const EmailBehaviour = require('hof-behaviour-emailer');

// configure email behaviour
const emailer = EmailBehaviour({
  transport: 'ses',
  transportOptions: {
    accessKeyId: '...',
    secretAccessKey: '...'
  },
  template: path.resolve(__dirname, './views/emails/confirm.html'),
  from: 'confirmation@homeoffice.gov.uk',
  recipient: 'customer-email',
  subject: 'Application Successful'
});

// in steps config
steps: {
  ...
  '/confirm': {
    behaviours: ['complete', emailer],
    next: '/confirmation',
    ...
  },
  ...
}
```

## Options

In addition to the options passed to `hof-emailer`, the following options can be used:

* `recipient` - _Required_ - defines the address to which email will be sent. This can be set either as a key to retrieve an email address from the session, or explicitly to an email address.
* `template` - _Required_ - defines the mustache template used to render the email content.
* `subject` - defines the subject line of the email.
* `parse` - parses the session model into an object used to populate the template.

`recipient` and `subject` options can also be defined as functions, which will be passed a copy of the session model as an argument, and should return a string value.
