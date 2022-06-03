# alex-amenitiz-cypress

This is a project containing a set of e2e tests for Amenitiz platform.

☝️ The project uses free tier of MailSlurp e-mail generator service with limited amount of inboxes. At the moment there are 35 more inboxes can be created.
That means the whole test suite can be run 35 more times. If this is not enough, create a new MailSlurp account and replace `mailSlurpKey` environment
variable in `cypress.config.js` file.

## Installation & running
1. Install dependencies with `npm install`
2. Run headless with `npm run test` or run via cypress UI with `npx cypress open`

## Technical decisions
### Cypress@10
I've decided to use version 10 even though it was published recently. In production environment I would be more conservative and would go with version 9 as more stable.
### MailSlurp
Sign-up step is a challenging task since it requires unique e-mail address every run. There are many options to resolve the issue. I decided to use third-party service MailSlurp to generate unique e-mails with access to them. There are other services but I've chosen that one due to well-designed API and good documentation.

## Next steps
If I had more time, I would take the following steps to improve the code:
* Review selectors. I would revise the selectors so that they look the same, separate selectors which are common to several forms into a separate group so as not to duplicate code.
* It may be worth looking for selectors by text, as this is closer to how user acts.
* Allocate the steps for completing the general form and the room form to a different group so that the tests are more granular.
* Re-use the piece of code that performs the login. To avoid duplication of the code, I would find a solution to re-use it (by using mocha beforeEach or some of cypress best practices)


