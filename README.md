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
