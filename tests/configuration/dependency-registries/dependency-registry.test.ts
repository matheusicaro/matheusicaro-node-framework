import { DependencyRegistry } from '../../../src/';
import { LoggerAdapter } from '../../../src/configuration/logger/logger.adapter';

describe('DependencyRegistry', () => {
  describe('constructor', () => {
    test('should register the default dependencies', () => {
      const dependencyRegistry = new DependencyRegistry([]);

      expect(dependencyRegistry.container.resolve('Logger')).toBeInstanceOf(LoggerAdapter);
    });

    test('should register the dependencies passed as arguments', () => {
      class TestA {}
      class TestB {}

      function registerCustomDependenciesTypeA(this: DependencyRegistry): void {
        this.container.register('TestA', {
          useValue: new TestA()
        });
      }

      function registerCustomDependenciesTypeB(this: DependencyRegistry): void {
        this.container.register('TestB', {
          useValue: new TestB()
        });
      }

      const dependencyRegistry = new DependencyRegistry([
        registerCustomDependenciesTypeA,
        registerCustomDependenciesTypeB
      ]);

      expect(dependencyRegistry.container.resolve('Logger')).toBeInstanceOf(LoggerAdapter);
      expect(dependencyRegistry.container.resolve('TestA')).toBeInstanceOf(TestA);
      expect(dependencyRegistry.container.resolve('TestB')).toBeInstanceOf(TestB);
    });
  });

  describe('resolve', () => {
    test('should resolve the correct dependency from the token', () => {
      class TestA {}

      function registerCustomDependenciesTypeA(this: DependencyRegistry): void {
        this.container.register('TestA', {
          useValue: new TestA()
        });
      }
      const dependencyRegistry = new DependencyRegistry([registerCustomDependenciesTypeA]);

      expect(dependencyRegistry.resolve('TestA')).toBeInstanceOf(TestA);
    });
  });

  describe('registerInstanceCache', () => {
    const dependencyRegistry = new DependencyRegistry([]);

    class SingletonClass {
      private counter = 0;
      private calls = 0;

      constructor() {
        this.counter++;
      }

      public getCounter() {
        this.calls++;

        return this.counter;
      }

      public getCounterCalls() {
        return this.calls;
      }
    }

    dependencyRegistry.registerInstanceCache('SingletonClass', new SingletonClass());

    test.each([1, 2, 3, 4, 5])(
      'should register dependency as a singleton correctly when called for the %s times',
      (times) => {
        const instance = dependencyRegistry.resolve<SingletonClass>('SingletonClass');

        /**
         * Every time a instance is created the count is incremented.
         * As a singleton class, the counter should always be 1
         */
        expect(instance.getCounter()).toEqual(1);
        /**
         * When getCounter() is called, the calls is registered by increment the calls field
         * As a singleton class, getCounterCalls() should always return the total of getCounter() calls
         */
        expect(instance.getCounterCalls()).toEqual(times);
      }
    );
  });
});
