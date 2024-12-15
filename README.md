# @mi-node-framework (matheusicaro)

This framework is a pack of @matheusicaro custom basic configurations and setups for quickly building services and APIs in [Node.js](https://nodejs.org/en) for short projects like hackathons, studies, challenges, etc..
A bunch of resources here might be useful for our next project 😃👍

#### Installing

```
npm i matheusicaro-node-framework
```

[npm package ](https://www.npmjs.com/package/matheusicaro-node-framework)

<br>

# Resources

- [@mi-node-framework (matheusicaro)](#mi-node-framework-matheusicaro) - [Installing](#installing)
- [Resources](#resources)
  - [Dependency Injection](#dependency-injection)
    - [1. Create your registers:](#1-create-your-registers)
    - [2. Start your registry](#2-start-your-registry)
    - [3. Use it](#3-use-it)
  - [Logger](#logger)
    - [1. by constructor injection](#1-by-constructor-injection)
    - [2. by resolving the instance](#2-by-resolving-the-instance)
    - [Files location:](#files-location)
  - [Controller Base](#controller-base)
    - [RestControllerBase](#restcontrollerbase)
  - [Errors](#errors)
    - [ErrorBase](#errorbase)
    - [InvalidArgumentError](#invalidargumenterror)
    - [InvalidRequestError](#invalidrequesterror)
    - [InvalidStateError](#invalidstateerror)
    - [NotFoundError](#notfounderror)

## Dependency Injection

An abstraction class for an injection container for TypeScript using [TSyring](https://github.com/microsoft/tsyringe).

This abstraction allows me to use dependency injection in a contract defined in this framework without knowing the main provider (TSyring in [v1.0.0](https://github.com/matheusicaro/matheusicaro-node-framework/releases/tag/1.0.0)).

If we decide to use another dependency injection provider, it will be easier for me to implement it here and update the following services with the new @mi-node-framework version.

<details><summary>How to use it?</summary>

#### 1. Create your registers:

```typescript
function registerProviders(this: DependencyRegistry): void {
  this.container.register(ProviderTokens.MyProvider, {
    useValue: new MyProvider()
  });
}

export { registerProviders };
```

#### 2. Start your registry

```typescript
import { DependencyRegistry } from 'matheusicaro-node-framework';

let dependencyRegistry: DependencyRegistry;

const getDependencyRegistryInstance = (): DependencyRegistry => {
  if (!dependencyRegistry) {
    dependencyRegistry = new DependencyRegistry([ registerProviders, ...and others]);
  }

  return dependencyRegistry;
};

export { getDependencyRegistryInstance };
```

#### 3. Use it

```typescript
// application layer

import { inject } from 'matheusicaro-node-framework';

class MyController {
  constructor(
    @inject(ProviderTokens.MyProvider)
    private myProvider: MyProviderPort
  ) {}

  public handler(): Promise<void> {
    this.myProvider.run();
  }
}

export { MyController };
```

```typescript
// tests layer

describe('MyController', () => {
  const provider = getDependencyRegistryInstance().resolve(ProviderTokens.MyProvider);

  //...
});
```

</details>

<br>

## Logger

This is a custom logger already setup with [winston](https://github.com/winstonjs/winston#readme).
The logger will be printed in the files app console

<details><summary>How to use it?</summary>

#### 1. by constructor injection

```typescript
import { DependencyInjectionTokens } from 'matheusicaro-node-framework';

class MyController {
  constructor(
    @inject(DependencyInjectionTokens.Logger)
    private logger: LoggerPort
  ) {}

  public handler(): Promise<void> {
    this.logger.info('trace handler');
  }
}
```

#### 2. by resolving the instance

```typescript
  const logger = getDependencyRegistryInstance().resolve(ProviderTokens.MyProvider)

  logger.info(message)
  logger.info(message, { id: "...", status: "..." })

  logger.error(message)
  logger.error(message, { id: "...", status: "...", error })

  logger.exception(error): void;
```

</details>

<details><summary>Log files</summary>

#### Files location:

- file: `logs/exceptions.log`

```
2024-11-27 14:47:58 [ ERROR ]==> uncaughtException: failed on starting the app Error: failed on starting the app
    at Timeout._onTimeout (/Users/matheus.icaro/DEVELOPMENT/repositories/test/mi-gateway-service/src/app.ts:41:9)
    at listOnTimeout (node:internal/timers:573:17)
    at processTimers (node:internal/timers:514:7)
```

- file: `logs/combined.log`

```
2024-11-27 14:50:53 [ ERROR ]==> {"message":"failed on starting the app","logData":{"trace_id":"fake_id","originalError":{"message":"its fail","stack":"Error: its fail\n    at Timeout._onTimeout (/Users/matheus.icaro/DEVELOPMENT/repositories/test/mi-gateway-service/src/app.ts:44:11)\n    at listOnTimeout (node:internal/timers:573:17)\n    at processTimers (node:internal/timers:514:7)"}}}

2024-11-27 14:53:37 [ INFO ]==> {"message":"logging data for trace","logData":{"id":"fake_id"}}
```

</details>

<br>

## Controller Base

The controller base is an abstract class with some useful resources to use, like handling errors and responding to the client with a pre-defined payload.

### RestControllerBase

[RestControllerBase](https://github.com/matheusicaro/matheusicaro-node-framework/blob/193fe58233f359c4212c986e9e03bef023d5f88c/src/controllers/rest-controller-base.ts#L22) is the a base controller to be used in rest implementations, recommended [express](https://github.com/expressjs/express).

<details>
<summary>How to use it?</summary>

```typescript
import { RestControllerBase } from 'matheusicaro-node-framework';

class HealthController extends RestControllerBase {
  constructor() {
    super();
  }

  public async getHealth(_req: Request, res: Response): Promise<Response<HealthResponse>> {
    try {
      return res.status(200).json({ message: 'success' });
    } catch (error) {
      return this.handleErrorThenRespondFailedOnRequest({
        error,
        response: res,
        responseData: {
          status: 'FAILED',
          time: new Date()
        }
      });
    }
  }
}

export { HealthController };
```

</details>

<br>

## Errors

You can use some custom errors in your business logic already implemented from `ErrorBase` which handle with logger and traces.

#### [ErrorBase](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/error-base.ts#L35)

you can implement your own errors from this `ErrorBase`.

<details>
<summary>How to use it?</summary>

```typescript
class MyCustomErrorError extends ErrorBase {
  constructor(message: string);
  constructor(trace: InvalidStateErrorTrace);
  constructor(message: string, trace?: InvalidStateErrorTrace);
  constructor(messageOrTrace: string | InvalidStateErrorTrace, _trace?: InvalidStateErrorTrace) {
    const { message, trace } = alignArgs(messageOrTrace, _trace);

    super(ErrorCode.INVALID_STATE, InvalidStateError.name, message, {
      userMessage: trace?.userMessage,
      originalError: trace?.logData?.error,
      ...(trace?.logData && {
        logs: {
          data: trace?.logData,
          level: LogLevel.ERROR,
          instance: container.resolve<LoggerPort>(DependencyInjectionTokens.Logger)
        }
      })
    });
  }
}

export { InvalidStateError };
```

</details>

#### [InvalidArgumentError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/invalid-argument.error.ts#L21)

`InvalidArgumentError` is a type of error recommended to be used when an invalid argument is informed.

- This error will:
  - surface to the user with a known message for the invalid argument.
  - Log automatically the error & "trace" field when it is present in the args
    - `new InvalidArgumentError(message)` => do not error & message -` new InvalidArgumentError(message, trace)` => do log message and trace fields

```typescript
new InvalidArgumentError('invalid argument', { userMessage: 'friendly user message', logData: { traceId: 'id' } });
```
- `userMessage` can be send in the response automatically when use RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))
<br>

#### [InvalidRequestError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/invalid-request.error.ts#L21)

`InvalidRequestError` is a type of error recommended to be used when an invalid argument is informed.

This error will:

- surface to the user with a known message for the invalid request.
- Log automatically the error & "trace" field when it is present in the args
  - `new InvalidRequestError(message)` => do not error & message
  - `new InvalidRequestError(message, trace)` => do log message and trace fields

```typescript
new InvalidRequestError('invalid request', { userMessage: 'friendly user message', logData: { traceId: 'id' } });
```
- `userMessage` can be send in the response automatically when use RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))
<br>

#### [InvalidStateError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/invalid-state.error.ts#L21)

`InvalidStateError` is a type of error recommended to be used when an invalid state is found and your app is not able to handle with.

This error will:

- surface to the user as a default error message (if not informed) once there is nothing the user can do at this point to fix the request
- Log automatically the error & "trace" field when it is present in the args
  - `new InvalidStateError(message)` => do not error & message
  - `new InvalidStateError(message, trace)` => do log message and trace fields

```typescript
new InvalidStateError('invalid state found', { userMessage: 'friendly user message', logData: { traceId: 'id' } });
```

- `userMessage` can be send in the response automatically when use RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))
<br>

#### [NotFoundError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/not-found.error.ts)

`NotFoundError` is a type of error recommended to be used when a resource is not found.

This error will:

- surface to the user as an unknown error once there is nothing the user can do at this point to fix the request.
- Log automatically the error & "trace" field when it is present in the args
  - `new InvalidStateError(message)` => do not error & message
  - `new InvalidStateError(message, trace)` => do log message and trace fields

```typescript
new NotFoundError('doc was not found', { userMessage: 'friendly user message', logData: { docId: 'id' } });
```

- `userMessage` can be send in the response automatically when use RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))

---

<img width="260" src="https://github.com/user-attachments/assets/a18a8fc2-bdec-43f8-a691-cb925efe6361">
