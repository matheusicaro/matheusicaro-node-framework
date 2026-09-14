import { vitestStub } from '../../../src/testing';

interface TestObject {
  id: string;
  func: () => number;
  other: () => string;
}

describe('vitestStub', () => {
  const viFnMock = () => {
    let returnValue: unknown;

    const fn = Object.assign((..._args: unknown[]) => returnValue, {
      mockReturnValue: (value: unknown) => {
        returnValue = value;
      }
    });

    return fn;
  };

  beforeAll(() => {
    (global as unknown as { vi: { fn: typeof viFnMock } }).vi = { fn: viFnMock };
  });

  afterAll(() => {
    delete (global as unknown as { vi?: unknown }).vi;
  });

  const stubTestObject = vitestStub<TestObject>();

  describe('stubbing', () => {
    test('should stub function correctly and set id', () => {
      stubTestObject.func.mockReturnValue(42);
      stubTestObject.id = 'some-id';

      const result = stubTestObject.func();

      expect(stubTestObject.id).toEqual('some-id');
      expect(result).toEqual(42);
    });

    test('should stub another function property independently', () => {
      stubTestObject.other.mockReturnValue('other value');

      expect(stubTestObject.other()).toEqual('other value');
    });

    test('should reuse the same stub for the same property on subsequent access', () => {
      const first = stubTestObject.other;
      const second = stubTestObject.other;

      expect(first).toBe(second);
    });
  });
});
