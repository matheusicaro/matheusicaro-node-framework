import { jstub } from './jest-auto-stub';
import { vstub, VitestStub } from './vitest-auto-stub';

const stub = {
  jest: jstub,
  vitest: vstub
};

export * from './deep-stub';
export { stub, VitestStub };
