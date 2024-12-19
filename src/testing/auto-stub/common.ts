/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecursivePartial, TrapsType } from './common-types';

/**
 * When use Vitest the vi will be provided in the global scope
 * ref: https://vitest.dev/config/
 */
declare const vi: any;

const commonHas = (target: RecursivePartial<any>, prop: string | symbol): boolean => {
  if (prop in target) {
    return true;
  }

  if (prop === 'then') {
    return false;
  }

  return true;
};

const commonGet = (input: {
  target: any;
  prop: string;
  test: 'jest' | 'vitest';
  map: Map<any, any>;
  traps: TrapsType;
}): any => {
  const { target, prop, test, map, traps } = input;

  if (test === 'jest') {
    if (['calls', 'mock'].includes(prop)) {
      return target[prop];
    }
  }

  if (prop in target) {
    return (target as any)[prop];
  }

  if (prop === 'then') {
    return;
  }

  if (!map.has(prop)) {
    if (test === 'jest') {
      const proxyToReturn = new Proxy(jest.fn(), traps);

      map.set(prop, proxyToReturn);

      return map.get(prop);
    } else {
      map.set(prop, vi.fn());
    }
  }

  return map.get(prop);
};

export { commonHas, commonGet };
