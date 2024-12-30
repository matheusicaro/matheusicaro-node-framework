import 'reflect-metadata';

import { container, InjectionToken, instanceCachingFactory } from 'tsyringe';
import { registerConfigs } from './config-registries';

type DependencyRegistryArgs = (this: DependencyRegistry) => void;

/**
 * This class is the default Dependency Registry from @mi-node-framework, which uses tsyringe for now.
 *
 * How to use: https://github.com/matheusicaro/mi-node-framework#dependency-injection
 *
 * @matheusicaro
 */
class DependencyRegistry {
  public container = container;

  constructor(registers: DependencyRegistryArgs[]) {
    /**
     * registerConfigs defines the default dependencies available in this project @mi-node-framework
     **/
    registerConfigs.call(this);

    for (const register of registers) {
      register.call(this);
    }
  }

  resolve<T>(token: InjectionToken<T>): T {
    return this.container.resolve(token);
  }

  /**
   * Register a single instance by instanceCachingFactory
   *
   * ref: https://github.com/microsoft/tsyringe?tab=readme-ov-file#instancecachingfactory
   *
   * @param token: tag that's identity the instance registered
   * @param providerInstance: the provider instance, exe: registerInstanceCache(token, new ProviderInstance())
   **/
  registerInstanceCache<T>(token: string, providerInstance: T): void {
    this.container.register(token, {
      useFactory: instanceCachingFactory<T>((_container) => providerInstance)
    });
  }
}

export { DependencyRegistry };
