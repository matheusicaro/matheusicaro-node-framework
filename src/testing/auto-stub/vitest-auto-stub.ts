/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mock } from 'vitest';

import { ArgumentTypes, Fn, RecursivePartial } from './common-types';
import { commonGet, commonHas } from './common';
import { DeepStubObject } from './deep-stub';

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

type StubValue<T> = T extends Fn ? Mock<ArgumentTypes<T>, ReturnType<T>> : T;

export type VitestStub<T> = {
  [P in keyof T]: StubValue<T[P]>;
};

/**
 * Vitest stub for interface and objects
 * how to use?
 * ref: TODO
 */
export function vitestStub<T extends {}>(base: RecursivePartial<T> = {}): T & DeepStubObject<T> {
  const map = new Map();

  const traps = {
    get(target: any, prop: string, _receiver: any): any {
      return commonGet({
        test: 'vitest',
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

  return new Proxy(base, traps) as T & DeepStubObject<T>;
}
