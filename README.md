# Juhlakalu

Demoparty management system by Jean Nine/Matt Current. Written in Rust, Typescript and React.

The goal is to implement super fast and reliable party management system.

Super work-in-progress not-even-alpha. In other words: not ready for any use yet.

## Required tools for development

- [Rust, Cargo](https://rustup.rs/)
- [Node](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [make](https://www.gnu.org/software/make/)
- [Postgres](https://www.postgresql.org/) or [Docker](https://www.docker.com/)

At some point I may dockerize this project for easier setup.

## Build

1. Run `make`
2. Built release is located at `release` folder.

## Development

1. Copy `.dev.example` to `.dev` and edit its contents to match your database and desired port.
2. Update latest dependencies by running `make dev-install`
3. Run `make dev`
4. Server starts running in the address configured in `.env`

Backend and frontend code both trigger recompiling. Hot-reload is disabled at the moment.

## Database

You can install and run Postgres normally. If you have Docker installed you can also start it by running `make docker-db`

## Running tests

1. Copy `.dev.example` to `.test.dev` and edit its contents to match your database and desired port.
2. Run `make test`

Juhlakalu runs mostly integration tests which means Postgres needs to be running during the tests.

## License

MIT
