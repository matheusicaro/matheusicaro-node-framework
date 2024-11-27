# @mi-node-framework (matheusicaro)

This framework is a pack of @matheusicaro custom basic configurations and setups for quickly building services and APIs in [Node.js](https://nodejs.org/en) for short projects like hackathons, studies, challenges, etc.
A bunch of resources here might be useful for our next project 😃👍

- [Dependency Injection](#dependency-injection)

<br>

## Dependency Injection

An abstraction class for an injection container for TypeScript using [TSyring](https://github.com/microsoft/tsyringe).

This abstraction allows me to use dependency injection in a contract defined in this framework without knowing the main provider (TSyring in [v1.0.0](https://github.com/matheusicaro/matheusicaro-node-framework/releases/tag/1.0.0)).

If we decide to use another dependency injection provider, it will be easier for me to implement it here and update the following services with the new @mi-node-framework version.

<details><summary>How to use it?</summary>

#### 1. create your registers:

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
The logger will be print in files app console

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

The controller base is an abstract class with some useful resources to use, like handle with errors and response to the client with a pre-defined payload.

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
