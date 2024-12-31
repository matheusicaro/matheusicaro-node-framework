import 'reflect-metadata';

import { container, InjectionToken, instanceCachingFactory } from 'tsyringe';
import { registerConfigs, DisableDefaultInstances } from './config-registries';
import { InvalidArgumentError } from '../../errors';

type DependencyRegistryArgs = (this: DependencyRegistry) => void;

export enum RegistryScope {
  SINGLETON = 'SINGLETON',
  TRANSIENT_NON_SINGLETON = 'TRANSIENT'
}

/**
 * This class is the default Dependency Registry from @mi-node-framework, which uses tsyringe for now.
 *
 * How to use: https://github.com/matheusicaro/mi-node-framework#dependency-injection
 *
 * @matheusicaro
 */
class DependencyRegistry {
  /**
   * @deprecated this reference will be removed soon, use getContainer() instead
   */
  public container = container; // TODO: make this private in the release 2.0.0, cause it is a break changes

  constructor(registers: DependencyRegistryArgs[], disableDefaultInstances?: DisableDefaultInstances) {
    /**
     * registerConfigs defines the default dependencies available in this project @mi-node-framework
     **/
    registerConfigs.call(this, disableDefaultInstances);

    for (const register of registers) {
      register.call(this);
    }
  }

  resolve<T>(token: InjectionToken<T>): T {
    return this.container.resolve(token);
  }

  register<T>(scope: RegistryScope, token: InjectionToken<T>, providerInstance: T): void {
    switch (scope) {
      case RegistryScope.SINGLETON:
        this.registerInstanceCache(token, providerInstance);
        return;

      case RegistryScope.TRANSIENT_NON_SINGLETON:
        this.container.register(token, { useValue: providerInstance });
        return;

      default:
        throw new InvalidArgumentError(`the scope ${scope} received is not available to be registered.`);
    }
  }

  /**
   * Return the container from Tsyringe
   * ref: https://github.com/microsoft/tsyringe?tab=readme-ov-file#container
   */
  getContainer() {
    return this.container;
  }

  /**
   * Register a single instance by instanceCachingFactory
   *
   * ref: https://github.com/microsoft/tsyringe?tab=readme-ov-file#instancecachingfactory
   *
   * @param token: tag that's identity the instance registered
   * @param providerInstance: the provider instance, exe: registerInstanceCache(token, new ProviderInstance())
   **/
  private registerInstanceCache<T>(token: InjectionToken<T>, providerInstance: T): void {
    this.container.register(token, {
      useFactory: instanceCachingFactory<T>((_container) => providerInstance)
    });
  }
}

export { DependencyRegistry };
