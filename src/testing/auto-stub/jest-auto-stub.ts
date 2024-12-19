/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { commonGet, commonHas } from './common';
import { RecursivePartial } from './common-types';
import { DeepStubObject } from './deep-stub';

/**
 * Jest stub for interface and objects.
 * How to use: TODO....
 */
export function jestStub<T extends {}>(base: RecursivePartial<T> = {}): T & DeepStubObject<T> {
  const map = new Map();

  const traps = {
    get(target: any, prop: string, _receiver: any): any {
      return commonGet({
        test: 'jest',
        target,
        prop,
        map,
        traps
      });
    },

    has(target: any, prop: string): boolean {
      return commonHas(target, prop);
    }
  };

  const proxy = new Proxy(base, traps);

  return proxy;
}
