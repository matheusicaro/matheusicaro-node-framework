import 'reflect-metadata';

import { container, InjectionToken, instanceCachingFactory } from 'tsyringe';
import { registerConfigs, getDefaultInstances, DisableDefaultInstances, DefaultInstances } from './config-registries';
import { InvalidArgumentError } from '../../errors';

type DependencyRegistryArgs = (this: DependencyRegistry) => void;

export enum RegistryScope {
  /**
   * Scope for singleton instances - same instance every time it is resolved
   */
  SINGLETON = 'SINGLETON',
  /**
   * Scope for transient instances - a new instance every time it is resolved
   */
  TRANSIENT_NON_SINGLETON = 'TRANSIENT'
}

/**
 * This class is the default Dependency Registry from matheusicaro-node-framework, which uses tsyringe for now.
 *
 * How to use: https://github.com/matheusicaro/matheusicaro-node-framework#dependency-injection
 *
 * @matheusicaro
 */
class DependencyRegistry {
  /**
   * @deprecated this reference will be removed soon, use getContainer() instead
   */
  // Known wart: kept public (not made private) to avoid an additional breaking change.
  // Prefer getContainer() for new code; this field stays for backwards compatibility.
  public container = container;

  /** Whether this instance disabled the default logger. */
  public loggerDisabled = false;

  constructor(registers: DependencyRegistryArgs[], disableDefaultInstances?: DisableDefaultInstances) {
    /**
     * registerConfigs defines the default dependencies available in this project matheusicaro-node-framework
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
   * Return the framework's default instances (e.g. the logger), already typed and resolved.
   * An instance is absent from the returned object when it was disabled via
   * DisableDefaultInstances at construction time.
   *
   * How to use: https://github.com/matheusicaro/matheusicaro-node-framework/tree/master?tab=readme-ov-file#getdefaultinstances
   *
   * @example
   * ```
   *  const { logger } = dependencyRegistry.getDefaultInstances();
   * ```
   */
  getDefaultInstances(): DefaultInstances {
    return getDefaultInstances.call(this);
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
