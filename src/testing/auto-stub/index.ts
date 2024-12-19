import { jestStub } from './jest-auto-stub';
import { vitestStub, VitestStub } from './vitest-auto-stub';

const stub = {
  jest: jestStub,
  vitest: vitestStub
};

export * from './deep-stub';
export { stub, VitestStub };
