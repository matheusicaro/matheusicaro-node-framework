import { instanceCachingFactory } from 'tsyringe';
import { DependencyRegistry } from './dependency-registry';
import { DependencyInjectionTokens } from './tokens';
import { LoggerAdapter } from '../logger/logger.adapter';

function registerConfigs(this: DependencyRegistry): void {
  /**
   * Registering useful instances
   *  Ref: https://github.com/microsoft/tsyringe#dependency-injection
   * @matheusicaro
   */
  this.container.register(DependencyInjectionTokens.Logger, {
    /**
     * Registering logger instance as a singleton
     *  Ref: https://github.com/microsoft/tsyringe?tab=readme-ov-file#instancecachingfactory
     * @matheusicaro
     */
    useFactory: instanceCachingFactory(() => new LoggerAdapter())
  });
}

export { registerConfigs };
