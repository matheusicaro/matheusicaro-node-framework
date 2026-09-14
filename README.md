# @mi-node-framework (matheusicaro)

This framework is a pack of @matheusicaro custom basic configurations and setups for quickly building services and APIs in [Node.js](https://nodejs.org/en) for short projects like hackathons, studies, challenges, etc.
A bunch of resources here might be useful for our next project 😃👍

#### Installing

[npm package](https://www.npmjs.com/package/matheusicaro-node-framework)

```
npm i matheusicaro-node-framework
```

#### Local Test

<details>
<summary>How to test the library locally?</summary>

<br>
1. in the library folder `mi-node-framework/`, run:
```terminal
npm i
npm run build
npm link
```

2. in the your project folder:
```terminal
npm uninstall matheusicaro-node-framework
npm link matheusicaro-node-framework
```
</details>

# Resources

- [Resources](#resources)
  - [Dependency Injection](#dependency-injection)
  - [Logger](#logger)
  - [Controller Base](#controller-base)
    - [RestControllerBase](#restcontrollerbase)
  - [Testing](#testing)
    - [Factory](#factory)
    - [Jest Stub](#jeststub)
    - [Vitest Stub](#viteststub)
    - [DeepStubObject](#deepstubobject)
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

How to use it:

<details><summary>1. Create your registers:</summary>

`MyProviderTokens` below is a token enum you define yourself (like `DependencyInjectionTokens`, but for your own providers):

```typescript
enum MyProviderTokens {
  MyProvider = 'MyProvider'
}

function registerProviders(this: DependencyRegistry): void {
  //
  this.register(RegistryScope.SINGLETON, MyProviderTokens.MyProvider, new MyProvider());
}

export { MyProviderTokens, registerProviders };
```
- check the avaialbe scopes in [RegistryScope](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/configuration/dependency-registries/dependency-registry.ts#L9-L18).
</details>

<details><summary>2. Start your registry</summary>

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
</details>

<details><summary>3. Injecting it</summary>

```typescript
// application layer

import { inject } from 'matheusicaro-node-framework';

class MyController {
  constructor(
    @inject(MyProviderTokens.MyProvider)
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
  const provider = getDependencyRegistryInstance().resolve(MyProviderTokens.MyProvider);

  //...
});
```
</details>

<br>
<br>

## Logger

This is a custom logger already setup with [winston](https://github.com/winstonjs/winston#readme).
The logger will be printed in the files app console

How to use it:

<details><summary>1. by constructor injection</summary>

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
</details>

<details><summary>2. by resolving the instance</summary>

```typescript
  const logger = getDependencyRegistryInstance().resolve(DependencyInjectionTokens.Logger)

  logger.info(message)
  logger.info(message, { id: "...", status: "..." })

  logger.error(message)
  logger.error(message, { id: "...", status: "...", error })

  logger.exception(error): void;
```
</details>

<details><summary>Location for the log files</summary>

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
<br>

## Controller Base

The controller base is an abstract class with some useful resources to use, like handling errors and responding to the client with a pre-defined payload.

### RestControllerBase

[RestControllerBase](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L22) is the a base controller to be used in rest implementations, recommended [express](https://github.com/expressjs/express).

Since [2.0.0](https://github.com/matheusicaro/matheusicaro-node-framework/releases), `RestControllerBase` requires the `DependencyRegistry` instance to be passed explicitly — it no longer resolves it from a hidden global.

<details>
<summary>How to use it?</summary>

```typescript
import { DependencyRegistry, RestControllerBase } from 'matheusicaro-node-framework';

class HealthController extends RestControllerBase {
  constructor(registry: DependencyRegistry) {
    super(registry);
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
<br>

## Testing

### Factory

A factory to build objects easier with overrides for their props.

How to use it:

<details>
<summary>1. create your factory</summary>

- `src/application/domain/entities/my-object.ts`
```typescript
// your entity/object

export interface MyObject {
  id: string;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
}
```

- `tests/factories/my-object.factory.ts`:
```typescript
// declare any custom function to override specific params and make it easier to build specific objects
class MyObjectFactory extends Factory<MyObject> {
  closed() {
    return this.params({
      status: 'CLOSED',
    });
  }

  open() {
    return this.params({
      status: 'OPEN',
    });
  }
}

// return the default object when build it
const myObjectFactory = MyObjectFactory.define(() => ({
  id: 'some-id',
  status: 'IN_PROGRESS',
}));

export { myObjectFactory };
```
</details>

<details>
<summary>2. Use it in your tests</summary>

```typescript
    import { myObjectFactory } from '../factories/my-object.factory.ts';


    it('should find all closed status', async () => {
      
      // build the object in the desired state pre-defined
      const myObject = myObjectFactory.closed().build();

      stubDatabase.findOne.mockResolvedValueOnce(myObject);

      const result = await provider.findAllClosedStatus();

      expect(result).toEqual([myObject]);
    });


    it('should find by id', async () => {

      //override the build with any value for the fields from your object
      const myObject = myObjectFactory.build({ id: "any id" });

      stubDatabase.findOne.mockResolvedValueOnce(myObject);

      const result = await provider.findById("any id");

      expect(result).toEqual(myObject);
    });
```
</details>
<br>

### JestStub

JestStub is a stub using </details>
 (`jest.fn()`) for interface, types and objects. 
You can easily stub/mock when you are testing.

<details>
<summary>How to use it?</summary>

```typescript
  import { jestStub } from 'matheusicaro-node-framework';

  //...

  const stubMyInterface = jestStub<MyInterface>();

  const myClass = new MyClass(stubMyInterface)

  //...

  test('should stub function correctly and set id', async () => {
    const userId = "id",

    stubMyInterface.anyMethod.mockResolvedValueOnce(100);

    const result = myClass.run(userId)

    expect(result).toEqual(100);
    expect(stubMyInterface).toHaveBeenCalledTimes(1);
    expect(stubMyInterface).toHaveBeenCalledWith(userId);
  });
```
</details>
<br>

### VitestStub

VitestStub is a stub that uses [Vitest](https://vitest.dev/api/vi.html#vi-fn) (`vi.fn()`) for interfaces, types, and objects. 
You can easily stub/mock when testing with **Vitest**.

<details>
<summary>How to use it? 👇</summary>

```typescript
  import { vitestStub } from 'matheusicaro-node-framework';

  //...

  const stubMyInterface = vitestStub<MyInterface>();

  const myClass = new MyClass(stubMyInterface)

  //...

  test('should stub function correctly and set id', async () => {
    const userId = "id",

    stubMyInterface.anyMethod.mockResolvedValueOnce(100);

    const result = myClass.run(userId)

    expect(result).toEqual(100);
    expect(stubMyInterface).toHaveBeenCalledTimes(1);
    expect(stubMyInterface).toHaveBeenCalledWith(userId);
  });
```
</details>
<br>

### DeepStubObject

DeepStubObject is a deep typer to be used when JestStub or VitesStub don't return the deeper prop.

<details>
<summary>How to use it? 👇</summary>

```typescript
  import { jestStub, vitestStub, DeepStubObject } from 'matheusicaro-node-framework';

  //...

  let stubProvider: ProviderInterface & DeepStubObject<ProviderInterface>;

  beforeAll(() => {

    // with jestStub
    stubProvider = jestStub<ProviderInterface>();

    // with vitestStub
    stubProvider = vitestStub<ProviderInterface>();

    myClass = new MyClass(stubProvider);
  });

  test('should stub function correctly and set id', async () => {
    //...
    stubMyInterface.anyProp.deepProp.deeperProp.mockResolvedValueOnce(100);
  });
```
</details>
<br>
<br>


## Errors

You can use some custom errors in your business logic already implemented from `ErrorBase` which handles with logger and traces.

#### [ErrorBase](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/error-base.ts#L35)

you can implement your own errors from this `ErrorBase`.

<details>
<summary>How to use it?</summary>

```typescript
class MyCustomError extends ErrorBase {
  constructor(message: string);
  constructor(trace: MyCustomErrorTrace);
  constructor(message: string, trace?: MyCustomErrorTrace);
  constructor(messageOrTrace: string | MyCustomErrorTrace, _trace?: MyCustomErrorTrace) {
    const { message, trace } = alignArgs(messageOrTrace, _trace);
    const { registry, ...traceWithoutRegistry } = trace ?? {};

    if (traceWithoutRegistry.logData && !registry) {
      throw new Error('MyCustomError: trace.registry is required when trace.logData is informed');
    }

    super(ErrorCode.INVALID_STATE, MyCustomError.name, message, {
      userMessage: traceWithoutRegistry.userMessage,
      originalError: traceWithoutRegistry.logData?.error,
      ...(traceWithoutRegistry.logData &&
        registry && {
          logs: {
            data: traceWithoutRegistry.logData,
            level: LogLevel.ERROR,
            // registry is your DependencyRegistry instance, passed in trace.registry
            instance: registry.resolve<LoggerPort>(DependencyInjectionTokens.Logger)
          }
        })
    });
  }
}

export { MyCustomError };
```
</details>
<br>

#### [InvalidArgumentError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/invalid-argument.error.ts#L21)

`InvalidArgumentError` is a type of error recommended to be used when an invalid argument is informed.

<details>
<summary>This error will: 👇</summary>

  - surface to the user with a known message for the invalid argument.
  - Log automatically the error & "trace" field when it is present in the args
    - `new InvalidArgumentError(message)` => do not error & message -` new InvalidArgumentError(message, trace)` => do log message and trace fields

```typescript
new InvalidArgumentError('invalid argument', {
  userMessage: 'friendly user message',
  logData: { traceId: 'id' },
  registry // a DependencyRegistry instance, required whenever logData is informed
});
```
- `userMessage` can be sent in the response automatically when using RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))
<br>
</details>
<br>


#### [InvalidRequestError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/invalid-request.error.ts#L21)

`InvalidRequestError` is a type of error recommended to be used when an invalid argument is informed.

<details>
<summary>This error will: 👇</summary>

- surface to the user with a known message for the invalid request.
- Log automatically the error & "trace" field when it is present in the args
  - `new InvalidRequestError(message)` => do not error & message
  - `new InvalidRequestError(message, trace)` => do log message and trace fields

```typescript
new InvalidRequestError('invalid request', {
  userMessage: 'friendly user message',
  logData: { traceId: 'id' },
  registry // a DependencyRegistry instance, required whenever logData is informed
});
```
- `userMessage` can be sent in the response automatically when using RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))
<br>
</details>
<br>

#### [InvalidStateError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/invalid-state.error.ts#L21)

`InvalidStateError` is a type of error recommended to be used when an invalid state is found and your app is not able to handle with.

<details>
<summary>This error will: 👇</summary>


- surface to the user as a default error message (if not informed) once there is nothing the user can do at this point to fix the request
- Log automatically the error & "trace" field when it is present in the args
  - `new InvalidStateError(message)` => do not error & message
  - `new InvalidStateError(message, trace)` => do log message and trace fields

```typescript
new InvalidStateError('invalid state found', {
  userMessage: 'friendly user message',
  logData: { traceId: 'id' },
  registry // a DependencyRegistry instance, required whenever logData is informed
});
```

- `userMessage` can be sent in the response automatically when using RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))
<br>
</details>
<br>

#### [NotFoundError](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/errors/not-found.error.ts)

`NotFoundError` is a type of error recommended to be used when a resource is not found.

<details>
<summary>This error will: 👇</summary>


- surface to the user as an unknown error once there is nothing the user can do at this point to fix the request.
- Log automatically the error & "trace" field when it is present in the args
  - `new NotFoundError(message)` => do not error & message
  - `new NotFoundError(message, trace)` => do log message and trace fields

```typescript
new NotFoundError('doc was not found', {
  userMessage: 'friendly user message',
  logData: { docId: 'id' },
  registry // a DependencyRegistry instance, required whenever logData is informed
});
```

- `userMessage` can be sent in the response automatically when using RestControllerBase ([here](https://github.com/matheusicaro/matheusicaro-node-framework/blob/master/src/controllers/rest-controller-base.ts#L68-L76))

<br>
</details>
<br>

---

<img width="260" src="https://github.com/user-attachments/assets/a18a8fc2-bdec-43f8-a691-cb925efe6361">
