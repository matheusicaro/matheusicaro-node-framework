# @mi-node-framework (matheusicaro)

This framework is a pack of @matheusicaro custom basic configurations and setups for quickly building services and APIs in [Node.js](https://nodejs.org/en) for short projects like hackathons, studies, challenges, etc.
A bunch of resources here might be useful for our next project 😃👍

- [Dependency Injection](#dependency-injection)


## Dependency Injection

An abstraction class for an injection container for TypeScript using [TSyring](https://github.com/microsoft/tsyringe).

This abstraction allows me to use dependency injection in a contract defined in this framework without knowing the main provider (TSyring in [v1.0.0](https://github.com/matheusicaro/matheusicaro-node-framework/releases/tag/1.0.0)).

If we decide to use another dependency injection provider, it will be easier for me to implement it here and update the following services with the new @mi-node-framework version.

<details><summary>How to use it? _(click here)_</summary>

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
    this.myProvider.run()
  }
}

export { MyController };
```
```typescript
// tests layer

describe('MyController', () => {

  const provider = getDependencyRegistryInstance().resolve(ProviderTokens.MyProvider)
 
  //...
});
```
</details>
