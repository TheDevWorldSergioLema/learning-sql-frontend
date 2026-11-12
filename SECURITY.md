# Security policy

The app runs entirely in the browser, with no backend and no account: the only data it stores is the student's
progress, in their own `localStorage`. Issues worth reporting include a way to run code in the page from a query or a
step, to read or change the app's own storage, or a vulnerable dependency.

## Reporting a vulnerability

Please don't open a public issue. Report it privately from the repository's **Security** tab, with
**Report a vulnerability**, and include the steps to reproduce it and the browser used.

I'll acknowledge the report as soon as possible and let you know once it's fixed. Only the latest version, deployed
from `main`, is supported.
