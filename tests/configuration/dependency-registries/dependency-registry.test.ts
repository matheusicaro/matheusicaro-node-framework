import { container, DependencyRegistry, InvalidArgumentError, RegistryScope } from '../../../src/';
import { LoggerAdapter } from '../../../src/configuration/logger/logger.adapter';

describe('DependencyRegistry', () => {
  const resetContainer = () => {
    container.reset();
  };

  beforeEach(resetContainer);

  describe('constructor', () => {
    beforeEach(resetContainer);

    test('should register the default instances', () => {
      const dependencyRegistry = new DependencyRegistry([]);

      expect(dependencyRegistry.resolve('Logger')).toBeInstanceOf(LoggerAdapter);
    });

    test('should not register the default instances when they are disabled', () => {
      const dependencyRegistry = new DependencyRegistry([], { loggerDisabled: true });

      expect(() => dependencyRegistry.resolve('Logger')).toThrow(
        'Attempted to resolve unregistered dependency token: "Logger"'
      );
    });

    test('should register the dependencies passed as arguments', () => {
      class TestA {}
      class TestB {}

      function registerCustomDependenciesTypeA(this: DependencyRegistry): void {
        this.register('TestA', new TestA(), RegistryScope.TRANSIENT_NON_SINGLETON);
      }

      function registerCustomDependenciesTypeB(this: DependencyRegistry): void {
        this.register('TestB', new TestB(), RegistryScope.SINGLETON);
      }

      const dependencyRegistry = new DependencyRegistry([
        registerCustomDependenciesTypeA,
        registerCustomDependenciesTypeB
      ]);

      expect(dependencyRegistry.resolve('Logger')).toBeInstanceOf(LoggerAdapter);
      expect(dependencyRegistry.resolve('TestA')).toBeInstanceOf(TestA);
      expect(dependencyRegistry.resolve('TestB')).toBeInstanceOf(TestB);
    });
  });

  describe('resolve', () => {
    beforeEach(resetContainer);

    test('should resolve the correct dependency from the token', () => {
      class TestA {}
      function registerCustomDependenciesTypeA(this: DependencyRegistry): void {
        this.register('TestA', new TestA(), RegistryScope.TRANSIENT_NON_SINGLETON);
      }
      const dependencyRegistry = new DependencyRegistry([registerCustomDependenciesTypeA]);
      expect(dependencyRegistry.resolve('TestA')).toBeInstanceOf(TestA);
    });
  });

  describe('register', () => {
    const totalResolvingClass = [1, 2, 3, 4, 5];

    class ExampleClass {
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

    const dependencyRegistry = new DependencyRegistry([]);

    dependencyRegistry.register('TransientClass', new ExampleClass(), RegistryScope.TRANSIENT_NON_SINGLETON);
    dependencyRegistry.register('SingletonClass', new ExampleClass(), RegistryScope.SINGLETON);

    describe.each(totalResolvingClass)('when the registered dependency is resolved for the %s times', (times) => {
      //
      const transientClass = dependencyRegistry.resolve<ExampleClass>('TransientClass');
      const singletonClass = dependencyRegistry.resolve<ExampleClass>('SingletonClass');

      /**
       *  GIVEN a TRANSIENT_NON_SINGLETON class,
       *  AND in the ExampleClass constructor the counter is incremented,
       */
      test('should resolve A NEW instance when scope is TRANSIENT_NON_SINGLETON', () => {
        /**
         * THEN, getCounter() should always be 1, (constructor is called once when create a instance)
         */
        expect(transientClass.getCounter()).toEqual(1);
      });

      /**
       *  GIVEN a SingletonClass instance resolved,
       *  AND in the ExampleClass constructor the counter is incremented,
       */
      test('should resolve the SAME FIRST instance registered when scope is SINGLETON', () => {
        /**
         * THEN, getCounter() should always be 1, (constructor is called once when create a instance)
         */
        expect(singletonClass.getCounter()).toEqual(1);
        /**
         * AND, getCounterCalls() should always be equal to the times that ExampleClass.getCounter() is called.
         *      - when ExampleClass.getCounter() is called, the private field ExampleClass.calls is incremented
         *      - and ExampleClass.getCounterCalls() is called, the private field ExampleClass.calls is returned
         */
        expect(singletonClass.getCounterCalls()).toEqual(times);
      });
    });

    test('should throw error when scope is not available', () => {
      const registerNoScopeClass = () => {
        return dependencyRegistry.register('NoScope', new ExampleClass(), 'ANY' as RegistryScope);
      };

      expect(registerNoScopeClass).toThrow(
        new InvalidArgumentError('the scope ANY received is not available to be registered.')
      );
    });
  });
});
