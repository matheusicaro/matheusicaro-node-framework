import { DependencyRegistry, RegistryScope } from './dependency-registry';
import { DependencyInjectionTokens } from './tokens';
import { LoggerAdapter } from '../logger/logger.adapter';

export interface DisableDefaultInstances {
  loggerDisabled: boolean;
}

function registerConfigs(this: DependencyRegistry, disableDefaultInstances?: DisableDefaultInstances): void {
  /**
   * Registering useful instances
   *  Ref: https://github.com/microsoft/tsyringe#dependency-injection
   *
   * @matheusicaro
   */

  if (!disableDefaultInstances?.loggerDisabled) {
    this.register(DependencyInjectionTokens.Logger, new LoggerAdapter(), RegistryScope.SINGLETON);
  }
}

export { registerConfigs };
