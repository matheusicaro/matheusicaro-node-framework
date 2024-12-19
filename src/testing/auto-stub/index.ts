import { jestStub } from './jest-auto-stub';
import { vitestStub, VitestStub } from './vitest-auto-stub';

/**
 * Stub interfaces, types and objects for Jest or Vitest
 * How to use it: =====>TODO
 */
const stub = {
  jest: jestStub,
  vitest: vitestStub
};

export { stub, VitestStub };
export * from './deep-stub';
