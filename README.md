# matheusicaro-node-framework

A small, opinionated TypeScript toolkit for bootstrapping Node.js services — dependency injection, a Winston-backed logger, an Express controller base, structured errors, and testing helpers, in one consistent package.

[![npm version](https://img.shields.io/npm/v/matheusicaro-node-framework)](https://www.npmjs.com/package/matheusicaro-node-framework)
[![license](https://img.shields.io/npm/l/matheusicaro-node-framework)](./LICENSE)
[![CI](https://github.com/matheusicaro/matheusicaro-node-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/matheusicaro/matheusicaro-node-framework/actions/workflows/ci.yml)

## Why this exists

I don't want to reinvent the wheel, but I also don't want to reinvent *this* wheel — the same DI setup, logger, error classes, and controller boilerplate — every time I start a new hackathon project, a small API, or a personal side project. This framework exists to accelerate that: one standard I fully control and understand, instead of copy-pasting the same setup file between repos or re-learning a heavier framework's conventions each time.

The trade-off I'm avoiding on both ends: hand-rolling the same DI container and error-handling boilerplate from scratch is wasted time, but pulling in a full framework like NestJS for a weekend project means adopting its opinions, its overhead, and its learning curve for something that doesn't need any of that. This sits in between — thin wrappers around solid libraries (`tsyringe`, `winston`, `express`), not a platform. Nothing here is deeply coupled to this package's own abstractions, so migrating to something more robust later, if a project outgrows it, stays realistic.

It's also a portfolio piece as much as a working tool — a place where my own conventions for DI, logging, and error handling live in one visible, versioned spot. You can read more about my other projects at [matheusicaro.com](https://matheusicaro.com).

See [CHANGELOG.md](./CHANGELOG.md) for the full 1.x → 2.x migration guide.

---

## Installation

```bash
npm install matheusicaro-node-framework
```

Both CommonJS (`require`) and ESM (`import`) are supported — the package ships `dist/index.js` (CJS), `dist/index.mjs` (ESM), and `dist/index.d.ts` (types), wired via `main`/`module`/`types` in `package.json`.

<details>
<summary>Testing a local build against another project</summary>

<br>

1. In this repo, build and link the package:

```bash
npm install
npm run build
npm link
```

2. In your project:

```bash
npm uninstall matheusicaro-node-framework
npm link matheusicaro-node-framework
```

</details>

---

## Contents

- [Quick start](#quick-start)
- [Dependency Injection](#dependency-injection)
- [Logger](#logger)
- [RestControllerBase](#restcontrollerbase)
- [Errors](#errors)
  - [ErrorBase](#errorbase)
  - [InvalidArgumentError](#invalidargumenterror)
  - [InvalidRequestError](#invalidrequesterror)
  - [InvalidStateError](#invalidstateerror)
  - [NotFoundError](#notfounderror)
- [Testing utilities](#testing-utilities)
  - [Factory](#factory)
  - [jestStub](#jeststub)
  - [vitestStub](#viteststub)
  - [DeepStubObject](#deepstubobject)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Quick start

A minimal end-to-end example: register a provider, wire it into a controller, and handle an error with logging.

```typescript
// tokens.ts
enum AppProviderTokens {
  UserProvider = 'UserProvider'
}

export { AppProviderTokens };
```

```typescript
// registry.ts
import { DependencyRegistry, RegistryScope } from 'matheusicaro-node-framework';
import { AppProviderTokens } from './tokens';
import { UserProvider } from './user-provider';

function registerProviders(this: DependencyRegistry): void {
  this.register(RegistryScope.SINGLETON, AppProviderTokens.UserProvider, new UserProvider());
}

let dependencyRegistry: DependencyRegistry;

function getDependencyRegistryInstance(): DependencyRegistry {
  if (!dependencyRegistry) {
    dependencyRegistry = new DependencyRegistry([registerProviders]);
  }

  return dependencyRegistry;
}

export { getDependencyRegistryInstance };
```

```typescript
// user-controller.ts
import { Request, Response } from 'express';
import {
  DependencyRegistry,
  RestControllerBase,
  NotFoundError,
  inject
} from 'matheusicaro-node-framework';
import { AppProviderTokens } from './tokens';
import { UserProvider } from './user-provider';

class UserController extends RestControllerBase {
  constructor(
    registry: DependencyRegistry,
    @inject(AppProviderTokens.UserProvider) private userProvider: UserProvider
  ) {
    super(registry);
    this.registry = registry;
  }

  private registry: DependencyRegistry;

  public async getUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userProvider.findById(req.params.id);

      if (!user) {
        throw new NotFoundError('user not found', {
          userMessage: 'No user with that id exists',
          logData: { userId: req.params.id },
          registry: this.registry
        });
      }

      this.logger.info('user found', { userId: user.id });

      return res.status(200).json(user);
    } catch (error) {
      return this.handleErrorThenRespondFailedOnRequest({
        error,
        response: res,
        setStatusCodeByErrorType: true
      });
    }
  }
}

export { UserController };
```

```typescript
// app.ts
import { getDependencyRegistryInstance } from './registry';
import { UserController } from './user-controller';

const registry = getDependencyRegistryInstance();
const userController = registry.resolve(UserController);
```

`NotFoundError` sets `userMessage` on the response automatically (via `handleErrorThenRespondFailedOnRequest`), and logs `logData` through the registry's logger since `registry` was passed alongside it. Omit `logData`/`registry` entirely for an error that doesn't need to log anything: `new NotFoundError('user not found')`.

---

## Dependency Injection

`DependencyRegistry` is a small abstraction over [tsyringe](https://github.com/microsoft/tsyringe). It exists so consumers depend on this framework's contract, not directly on tsyringe — if the underlying provider ever changes, only this package needs to change.

<details>
<summary>1. Define your own provider tokens and registration function</summary>

`AppProviderTokens` below is a token enum you define yourself — the framework only ships its own internal token (`DependencyInjectionTokens.Logger`), not a shared enum for your providers.

```typescript
import { DependencyRegistry, RegistryScope } from 'matheusicaro-node-framework';

enum AppProviderTokens {
  MyProvider = 'MyProvider'
}

function registerProviders(this: DependencyRegistry): void {
  this.register(RegistryScope.SINGLETON, AppProviderTokens.MyProvider, new MyProvider());
}

export { AppProviderTokens, registerProviders };
```

Available scopes ([`RegistryScope`](./src/configuration/dependency-registries/dependency-registry.ts)):

- `RegistryScope.SINGLETON` — the same instance every time it's resolved.
- `RegistryScope.TRANSIENT_NON_SINGLETON` — a new registration each time (no instance caching).

</details>

<details>
<summary>2. Create your registry instance</summary>

```typescript
import { DependencyRegistry } from 'matheusicaro-node-framework';
import { registerProviders } from './registry-providers';

let dependencyRegistry: DependencyRegistry;

function getDependencyRegistryInstance(): DependencyRegistry {
  if (!dependencyRegistry) {
    dependencyRegistry = new DependencyRegistry([registerProviders]);
  }

  return dependencyRegistry;
}

export { getDependencyRegistryInstance };
```

The constructor also accepts an optional second argument, `DisableDefaultInstances` (currently `{ loggerDisabled: boolean }`), to opt out of the framework's own default registrations (e.g. the default logger) if you want to register your own under the same token.

</details>

<details>
<summary>3. Inject and resolve</summary>

```typescript
// application layer
import { inject } from 'matheusicaro-node-framework';
import { AppProviderTokens } from './tokens';

class MyController {
  constructor(@inject(AppProviderTokens.MyProvider) private myProvider: MyProviderPort) {}

  public handler(): Promise<void> {
    return this.myProvider.run();
  }
}

export { MyController };
```

```typescript
// tests
describe('MyController', () => {
  const provider = getDependencyRegistryInstance().resolve(AppProviderTokens.MyProvider);

  // ...
});
```

`inject`/`singleton` are re-exported as-is from `tsyringe` via this package's own `decorators` module — you don't import them from `tsyringe` directly. The framework also re-exports the `InjectionToken` type from `tsyringe` itself, since it's needed for `register`/`resolve`'s generic signatures.

</details>

<details>
<summary>getDefaultInstances()</summary>

Returns the framework's own currently-registered default instances, already resolved and typed — today, just the logger:

```typescript
const { logger } = getDependencyRegistryInstance().getDefaultInstances();

logger?.info('using the default logger directly');
```

An entry is absent from the returned object if it was turned off via `DisableDefaultInstances` at construction time (e.g. `{ loggerDisabled: true }` means `logger` is `undefined`).

</details>

`DependencyRegistry` also exposes `getContainer()`, which returns the underlying tsyringe container directly — useful for tsyringe APIs this wrapper doesn't cover. The `container` public field does the same thing but is deprecated; prefer `getContainer()`.

---

## Logger

A `LoggerPort`-shaped logger backed by [winston](https://github.com/winstonjs/winston), registered by default under `DependencyInjectionTokens.Logger`.

<details>
<summary>1. By constructor injection</summary>

```typescript
import { inject, DependencyInjectionTokens, LoggerPort } from 'matheusicaro-node-framework';

class MyController {
  constructor(@inject(DependencyInjectionTokens.Logger) private logger: LoggerPort) {}

  public handler(): void {
    this.logger.info('trace handler');
  }
}
```

</details>

<details>
<summary>2. By resolving the instance</summary>

```typescript
import { DependencyInjectionTokens, LoggerPort } from 'matheusicaro-node-framework';

const logger = getDependencyRegistryInstance().resolve<LoggerPort>(DependencyInjectionTokens.Logger);

logger.info('message');
logger.info('message', { id: '...', status: '...' });

logger.error({ message: 'message', error, logData: { id: '...' } });

logger.exception(error); // error: ErrorBase
```

</details>

<details>
<summary>Extending LoggerBase</summary>

`LoggerBase` (the abstract class backing the default logger) is exported so you can extend it externally — for example to change the underlying winston transport configuration while keeping the same `info`/`error`/`exception` contract.

```typescript
import { LoggerBase } from 'matheusicaro-node-framework';

class MyLogger extends LoggerBase {
  // override or extend as needed
}
```

</details>

<details>
<summary>Log file locations</summary>

On import, the logger's setup module creates a `logs/` directory synchronously (`mkdirSync`, if it doesn't already exist) before any logger instance is built. The only way to opt out today is to skip the default logger entirely via `DisableDefaultInstances` (see [Dependency Injection](#dependency-injection)) — there's currently no more targeted option (e.g. a config flag to disable just the file transport).

- `logs/exceptions.log`

```
2024-11-27 14:47:58 [ ERROR ]==> uncaughtException: failed on starting the app Error: failed on starting the app
    at Timeout._onTimeout (/path/to/app.ts:41:9)
    at listOnTimeout (node:internal/timers:573:17)
    at processTimers (node:internal/timers:514:7)
```

- `logs/combined.log`

```
2024-11-27 14:50:53 [ ERROR ]==> {"message":"failed on starting the app","logData":{"trace_id":"fake_id","originalError":{"message":"its fail","stack":"..."}}}
2024-11-27 14:53:37 [ INFO ]==> {"message":"logging data for trace","logData":{"id":"fake_id"}}
```

</details>

---

## RestControllerBase

[`RestControllerBase`](./src/controllers/rest-controller-base.ts) is an abstract base class for Express REST controllers, with built-in error handling and response helpers.

Since 2.0.0, `RestControllerBase` requires a `DependencyRegistry` instance passed explicitly to `super(registry)` — it no longer resolves one from a hidden global container.

<details>
<summary>How to use it</summary>

```typescript
import { Request, Response } from 'express';
import { DependencyRegistry, RestControllerBase } from 'matheusicaro-node-framework';

class HealthController extends RestControllerBase {
  constructor(registry: DependencyRegistry) {
    super(registry);
  }

  public async getHealth(_req: Request, res: Response): Promise<Response> {
    try {
      return res.status(200).json({ message: 'success' });
    } catch (error) {
      return this.handleErrorThenRespondFailedOnRequest({
        error,
        response: res,
        responseData: { status: 'FAILED', time: new Date() }
      });
    }
  }
}

export { HealthController };
```

The constructor also accepts two optional arguments after `registry`: a custom failed-request HTTP status code (default `502`) and a custom failed-request response payload (default `{ message: 'error on processing the request' }`).

`handleErrorThenRespondFailedOnRequest({ error, response, responseData?, setStatusCodeByErrorType? })`:

- Logs the error (unless it's already an `ErrorBase`, which self-logs on construction).
- Responds with the constructor's default status/payload, merging in `responseData` and the error's `userMessage` when present.
- When `setStatusCodeByErrorType` is `true`, maps `InvalidArgumentError`/`InvalidRequestError` → `400`, `NotFoundError` → `404`, anything else → the configured default (`502` unless overridden).

</details>

---

## Errors

Custom error classes built on `ErrorBase`, which integrates logging and trace metadata.

#### ErrorBase

Implement your own errors on top of [`ErrorBase`](./src/errors/error-base.ts):

<details>
<summary>How to use it</summary>

```typescript
// This is a standalone example, not a copy of InvalidStateError's real defaults.
import { ErrorBase, ErrorCode, ErrorTrace, LogLevel, LoggerPort, DependencyInjectionTokens, alignArgs } from 'matheusicaro-node-framework';

class MyCustomError extends ErrorBase {
  constructor(message: string);
  constructor(trace: ErrorTrace);
  constructor(message: string, trace?: ErrorTrace);
  constructor(messageOrTrace: string | ErrorTrace, _trace?: ErrorTrace) {
    const { message, trace } = alignArgs(messageOrTrace, _trace);
    const { registry, ...traceWithoutRegistry } = trace ?? {};

    if (traceWithoutRegistry.logData && !registry) {
      throw new Error('MyCustomError: trace.registry is required when trace.logData is informed');
    }

    super(ErrorCode.INVALID_STATE, MyCustomError.name, message ?? 'invalid state', {
      userMessage: traceWithoutRegistry.userMessage,
      originalError: traceWithoutRegistry.logData?.error,
      ...(traceWithoutRegistry.logData &&
        registry && {
          logs: {
            data: traceWithoutRegistry.logData,
            level: LogLevel.ERROR,
            instance: registry.resolve<LoggerPort>(DependencyInjectionTokens.Logger)
          }
        })
    });
  }
}

export { MyCustomError };
```

</details>

#### InvalidArgumentError

[`InvalidArgumentError`](./src/errors/invalid-argument.error.ts) — use when an invalid argument was supplied. Unlike the other three, the message is required (it throws if omitted).

<details>
<summary>This error will</summary>

- Surface `userMessage` to the client when used with `RestControllerBase`.
- Log the error and trace only when `logData` (and therefore `registry`) is passed:
  - `new InvalidArgumentError(message)` → no logging.
  - `new InvalidArgumentError(message, trace)` → logs `message` and `trace.logData`.

```typescript
new InvalidArgumentError('invalid argument', {
  userMessage: 'friendly user message',
  logData: { traceId: 'id' },
  registry // a DependencyRegistry instance, required whenever logData is informed
});
```

</details>

#### InvalidRequestError

[`InvalidRequestError`](./src/errors/invalid-request.error.ts) — use when an incoming request itself is invalid.

<details>
<summary>This error will</summary>

- Surface `userMessage` to the client when used with `RestControllerBase`.
- Log the error and trace only when `logData` (and therefore `registry`) is passed:
  - `new InvalidRequestError(message)` → no logging.
  - `new InvalidRequestError(message, trace)` → logs `message` and `trace.logData`.

```typescript
new InvalidRequestError('invalid request', {
  userMessage: 'friendly user message',
  logData: { traceId: 'id' },
  registry
});
```

</details>

#### InvalidStateError

[`InvalidStateError`](./src/errors/invalid-state.error.ts) — use when the app reaches a state it can't recover from; nothing the user can do about it.

<details>
<summary>This error will</summary>

- Surface a default error message to the client when used with `RestControllerBase` (unless `userMessage` is set).
- Log the error and trace only when `logData` (and therefore `registry`) is passed:
  - `new InvalidStateError(message)` → no logging.
  - `new InvalidStateError(message, trace)` → logs `message` and `trace.logData`.

```typescript
new InvalidStateError('invalid state found', {
  userMessage: 'friendly user message',
  logData: { traceId: 'id' },
  registry
});
```

</details>

#### NotFoundError

[`NotFoundError`](./src/errors/not-found.error.ts) — use when a resource wasn't found. `message` defaults to `'Not found'` if omitted.

<details>
<summary>This error will</summary>

- Surface `userMessage` to the client when used with `RestControllerBase`.
- Log the error and trace only when `logData` (and therefore `registry`) is passed:
  - `new NotFoundError(message)` → no logging.
  - `new NotFoundError(message, trace)` → logs `message` and `trace.logData`.

```typescript
new NotFoundError('doc was not found', {
  userMessage: 'friendly user message',
  logData: { docId: 'id' },
  registry
});
```

</details>

---

## Testing utilities

### Factory

A [fishery](https://github.com/thoughtbot/fishery)-based builder for constructing test objects with overridable fields.

`Factory` is a thin subclass of fishery's own `Factory`, so every fishery feature is available as-is — associations, sequences, transient params, `afterBuild`/`afterCreate` hooks, and so on. See [fishery's README](https://github.com/thoughtbot/fishery) for the full API rather than this section, which only covers the basics.

<details>
<summary>1. Create your factory</summary>

```typescript
// src/application/domain/entities/my-object.ts
export interface MyObject {
  id: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
}
```

```typescript
// tests/factories/my-object.factory.ts
import { Factory } from 'matheusicaro-node-framework';
import { MyObject } from '../../src/application/domain/entities/my-object';

class MyObjectFactory extends Factory<MyObject> {
  closed() {
    return this.params({ status: 'CLOSED' });
  }

  open() {
    return this.params({ status: 'OPEN' });
  }
}

const myObjectFactory = MyObjectFactory.define(() => ({
  id: 'some-id',
  status: 'IN_PROGRESS'
}));

export { myObjectFactory };
```

</details>

<details>
<summary>2. Use it in your tests</summary>

```typescript
import { myObjectFactory } from '../factories/my-object.factory';

it('should find all closed status', async () => {
  const myObject = myObjectFactory.closed().build();

  stubDatabase.findOne.mockResolvedValueOnce(myObject);

  const result = await provider.findAllClosedStatus();

  expect(result).toEqual([myObject]);
});

it('should find by id', async () => {
  const myObject = myObjectFactory.build({ id: 'any id' });

  stubDatabase.findOne.mockResolvedValueOnce(myObject);

  const result = await provider.findById('any id');

  expect(result).toEqual(myObject);
});
```

</details>

### jestStub

Auto-stubs any interface/type/object with `jest.fn()`, so every accessed property resolves to a mock function without hand-writing each one.

Requires `@types/jest` in your own project for full type support — it's not bundled as a dependency of this package.

<details>
<summary>How to use it</summary>

```typescript
import { jestStub } from 'matheusicaro-node-framework';

const stubMyInterface = jestStub<MyInterface>();
const myClass = new MyClass(stubMyInterface);

test('should stub function correctly and set id', async () => {
  const userId = 'id';

  stubMyInterface.anyMethod.mockResolvedValueOnce(100);

  const result = await myClass.run(userId);

  expect(result).toEqual(100);
  expect(stubMyInterface.anyMethod).toHaveBeenCalledTimes(1);
  expect(stubMyInterface.anyMethod).toHaveBeenCalledWith(userId);
});
```

</details>

### vitestStub

Same idea as `jestStub`, backed by [Vitest's `vi.fn()`](https://vitest.dev/api/vi.html#vi-fn) instead.

<details>
<summary>How to use it</summary>

```typescript
import { vitestStub } from 'matheusicaro-node-framework';

const stubMyInterface = vitestStub<MyInterface>();
const myClass = new MyClass(stubMyInterface);

test('should stub function correctly and set id', async () => {
  const userId = 'id';

  stubMyInterface.anyMethod.mockResolvedValueOnce(100);

  const result = await myClass.run(userId);

  expect(result).toEqual(100);
  expect(stubMyInterface.anyMethod).toHaveBeenCalledTimes(1);
  expect(stubMyInterface.anyMethod).toHaveBeenCalledWith(userId);
});
```

</details>

### DeepStubObject

A type helper for when `jestStub`/`vitestStub` need to reach nested properties, not just the top level.

<details>
<summary>How to use it</summary>

```typescript
import { jestStub, vitestStub, DeepStubObject } from 'matheusicaro-node-framework';

let stubProvider: ProviderInterface & DeepStubObject<ProviderInterface>;

beforeAll(() => {
  // with jestStub
  stubProvider = jestStub<ProviderInterface>();

  // or with vitestStub
  stubProvider = vitestStub<ProviderInterface>();

  myClass = new MyClass(stubProvider);
});

test('should stub a deeply nested property', async () => {
  stubProvider.anyProp.deepProp.deeperProp.mockResolvedValueOnce(100);
});
```

</details>

---

## Contributing

```bash
npm install
npm run lint    # eslint .
npm test        # jest
npm run build   # tsup — builds CJS + ESM + .d.ts into dist/
```

Branch names follow `<issue-number>-<slug>` (e.g. `45-improve-readme-and-narrative`).

This repo uses [changesets](https://github.com/changesets/changesets) for versioning and the changelog. Any PR touching `src/**` needs an accompanying changeset — CI checks for one (`npx changeset status`). Run `npx changeset` and follow the prompts; for a change with no consumer-visible effect, `npx changeset add --empty` satisfies the check without adding a changelog entry.

---

## License

[MIT](./LICENSE)

---

## Author

Built by [@matheusicaro](https://github.com/matheusicaro) — more projects at [matheusicaro.com](https://matheusicaro.com).
