# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [2.0.0]

### Breaking changes

- **`RestControllerBase` and the built-in error classes no longer resolve the logger from a hidden global container.** They now require an explicit `DependencyRegistry` instance:
  - `RestControllerBase`'s constructor takes a `DependencyRegistry` as its first argument: `super(registry)` instead of `super()`.
  - `InvalidArgumentError`, `InvalidRequestError`, `InvalidStateError`, and `NotFoundError` now require a `registry` field on their trace object whenever `logData` is also passed: `new InvalidStateError('msg', { logData, registry })`. Constructing any of these errors **without** `logData` is unaffected — `new InvalidStateError('msg')` still works exactly as before, with no registry needed.
  - **Migration:** pass your `DependencyRegistry` instance down to every `RestControllerBase` subclass constructor, and add `registry` alongside any existing `logData` in an error's trace object.

### Added

- Export `LoggerBase` from the package root so it can be extended externally.
- Add a `sleep` utility (`import { sleep } from 'matheusicaro-node-framework'`).
- Add `DependencyRegistry.getDefaultInstances()`, returning a typed, extensible object of the framework's currently-registered default instances (`{ logger }` today).
- Add a GitHub Actions CI workflow (lint, test with coverage, build) running on every push/PR to `master`, with branch protection requiring it to pass before merge.

### Fixed

- `import 'reflect-metadata'` is now included in the package's own entry point, so consumers no longer need to add it themselves to avoid tsyringe's polyfill error.
- The package no longer re-exports the entirety of `tsyringe`'s API (`export * from 'tsyringe'`) — only the `InjectionToken` type is re-exported, since that's the one symbol actually needed to use `DependencyRegistry.register`/`resolve`. `inject`/`singleton` remain available via the framework's own `decorators` export.
- Fixed several README examples referencing a nonexistent `ProviderTokens` symbol (the real token enum for a consumer's own providers is one you define yourself, shown in the Dependency Injection section).
- Fixed a README example showing how to resolve the Logger that used the wrong token.

### Chores

- Migrated `.eslintignore` into `eslint.config.mjs`'s `ignores` array.
- Fixed stale `package.json` URLs (`homepage`, `repository`, `bugs`) that still pointed at the old `mi-node-framework` repo name.
- Removed dead `"husky"` config from `package.json` (husky v9+ reads `.husky/` directly; this block referenced a script that didn't exist).
- Resolved `npm audit` findings (26 → 1); the one remaining low-severity finding is transitively pinned by `tsup` and has no upstream fix available yet.
