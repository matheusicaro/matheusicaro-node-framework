import 'reflect-metadata';

import { container, InjectionToken } from 'tsyringe';
import { registerConfigs } from './config-registries';

type DependencyRegistryArgs = (this: DependencyRegistry) => void;

/**
 * This class is the default Dependency Registry from @mi-node-framework, which uses tsyringe for now.
 *
 * How to use: https://github.com/matheusicaro/mi-node-framework#mi-node-framework
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
}

export { DependencyRegistry };
