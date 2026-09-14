import { container } from 'tsyringe';
import { DependencyRegistry } from '../../../src/';
import { LoggerAdapter } from '../../../src/configuration/logger/logger.adapter';

describe('registerConfigs', () => {
  beforeEach(() => {
    container.reset();
  });

  test('should register the logger instance as a singleton by default', () => {
    const dependencyRegistry = new DependencyRegistry([]);

    const first = dependencyRegistry.resolve('Logger');
    const second = dependencyRegistry.resolve('Logger');

    expect(first).toBeInstanceOf(LoggerAdapter);
    expect(first).toBe(second);
  });

  test('should not register the logger instance when disabled', () => {
    const dependencyRegistry = new DependencyRegistry([], { loggerDisabled: true });

    expect(() => dependencyRegistry.resolve('Logger')).toThrow(
      'Attempted to resolve unregistered dependency token: "Logger"'
    );
  });
});

describe('getDefaultInstances', () => {
  beforeEach(() => {
    container.reset();
  });

  test('should return the logger instance when it is registered', () => {
    const dependencyRegistry = new DependencyRegistry([]);

    const defaults = dependencyRegistry.getDefaultInstances();

    expect(defaults.logger).toBeInstanceOf(LoggerAdapter);
  });

  test('should not include the logger when it is disabled', () => {
    const dependencyRegistry = new DependencyRegistry([], { loggerDisabled: true });

    const defaults = dependencyRegistry.getDefaultInstances();

    expect(defaults.logger).toBeUndefined();
  });

  test('should return the same instance resolve() would return', () => {
    const dependencyRegistry = new DependencyRegistry([]);

    const defaults = dependencyRegistry.getDefaultInstances();
    const resolved = dependencyRegistry.resolve('Logger');

    expect(defaults.logger).toBe(resolved);
  });
});
