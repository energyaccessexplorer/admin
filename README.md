# Energy Access Explorer Admin

This is the frontend code for the platform's admin panel.

## Development

The magic is really done by [duck-tape](). This repository only contains the
EAE's specific code. Basic tasks for administration/development tools are
contained in the `makefile`.

## Building & hacking

Assumptions made:

- development is in a Unix-like environment (cat, sed, echo, make...)
  with a _static web server_ and rsync installed
- [PostgREST](https://postgrest.org) is installed.
- an PostgreSQL instance is running the
  [database](https://github.com/energyaccessexplorer/database)
- (optionally) the [website](https://github.com/energyaccessexplorer/website)
  is running

To get started, you will need to

    $ cp default.mk-sample default.mk

and configure `default.mk` to your needs. Where the `WATCH` variable is a custom
command to rebuild the project upon code changes. This is left to the developer
to use whatever he/she desires.

Then fetch and install the contents of `dependencies.tsv` under `dist/lib/`

Now you can run in development mode with:

    $ make reconfig build start watch

Once up and running, on another terminal run

    $ make signin

visit `http://localhost:${WEB_PORT}` on your web browser, open the developer
tools and copy/paste the result.
