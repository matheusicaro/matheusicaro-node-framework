import { inject as tsyringeInject, singleton as tsyringeSingleton } from 'tsyringe';

import { inject, singleton } from '../../../src/configuration/dependency-registries/decorators';

describe('decorators', () => {
  test('should re-export inject from tsyringe', () => {
    expect(inject).toBe(tsyringeInject);
  });

  test('should re-export singleton from tsyringe', () => {
    expect(singleton).toBe(tsyringeSingleton);
  });
});
