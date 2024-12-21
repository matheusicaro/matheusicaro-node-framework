/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ArgumentTypes, Fn, RecursivePartial } from './common-types';
import { commonGet, commonHas } from './common';
import { DeepStubObject } from './deep-stub';
import { Mock } from './vitest-auto-stub.types';

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

type StubValue<T> = T extends Fn ? Mock<ArgumentTypes<T>, ReturnType<T>> : T;

export type VitestStub<T> = {
  [P in keyof T]: StubValue<T[P]>;
};

/**
 * Declaring global worker to fix issue from Vite in Vitest
 * issue: https://github.com/vitejs/vite/issues/14513
 */
declare global {
  interface Worker {}

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace WebAssembly {
    interface Module {}
  }
}

/**
 * vitestStub is a stub using jest mock for interface, types and objects.
 *
 * How to use: https://github.com/matheusicaro/matheusicaro-node-framework/tree/master?tab=readme-ov-file#viteststub
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
