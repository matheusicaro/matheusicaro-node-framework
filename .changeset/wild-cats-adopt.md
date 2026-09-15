---
"matheusicaro-node-framework": major
---

**Breaking:** `RestControllerBase` and the built-in error classes (`InvalidArgumentError`, `InvalidRequestError`, `InvalidStateError`, `NotFoundError`) no longer resolve the logger from a hidden global container — they now require an explicit `DependencyRegistry` instance. `RestControllerBase` subclasses must pass it to `super(registry)`; error classes only need it in the trace object when `logData` is also passed (`new SomeError('msg', { logData, registry })`). See `CHANGELOG.md` for the full migration guide.

Also in this release: `LoggerBase` is now exported for external use, a `sleep` utility was added, `import 'reflect-metadata'` was added to the entry point (fixes a tsyringe polyfill crash), `DependencyRegistry.getDefaultInstances()` was added, the package no longer re-exports the entirety of `tsyringe`, and this repo adopted changesets for changelog/version/release automation going forward.
