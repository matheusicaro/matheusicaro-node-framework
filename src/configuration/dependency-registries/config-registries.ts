import { DependencyRegistry, RegistryScope } from './dependency-registry';
import { DependencyInjectionTokens } from './tokens';
import { LoggerAdapter } from '../logger/logger.adapter';
import { LoggerPort } from '../logger/logger.port';

export interface DisableDefaultInstances {
  loggerDisabled: boolean;
}

/**
 * Shape of the instances resolved by DependencyRegistry.getDefaultInstances().
 * Each entry is optional since it can be turned off via DisableDefaultInstances.
 *
 * Add new default instances here (and in registerConfigs) as they're introduced,
 * so getDefaultInstances() grows without a breaking change for existing consumers.
 */
export interface DefaultInstances {
  logger?: LoggerPort;
}

function registerConfigs(this: DependencyRegistry, disableDefaultInstances?: DisableDefaultInstances): void {
  /**
   * Registering useful instances
   *  Ref: https://github.com/microsoft/tsyringe#dependency-injection
   *
   * @matheusicaro
   */

  // Tracked per-instance since tsyringe's container is a shared singleton.
  this.loggerDisabled = Boolean(disableDefaultInstances?.loggerDisabled);

  if (!this.loggerDisabled) {
    this.register(RegistryScope.SINGLETON, DependencyInjectionTokens.Logger, new LoggerAdapter());
  }
}

function getDefaultInstances(this: DependencyRegistry): DefaultInstances {
  const instances: DefaultInstances = {};

  if (!this.loggerDisabled && this.getContainer().isRegistered(DependencyInjectionTokens.Logger)) {
    instances.logger = this.resolve<LoggerPort>(DependencyInjectionTokens.Logger);
  }

  return instances;
}

export { registerConfigs, getDefaultInstances };
