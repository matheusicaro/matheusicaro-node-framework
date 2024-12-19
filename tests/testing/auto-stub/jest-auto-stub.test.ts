import { faker, jestStub } from '../../../src/testing';

type AnyFunction = () => string;

interface TestObject {
  id: string;
  func: () => number;
  deep: {
    deeper: {
      deepFunction: () => string;
      arrayOfFunctions: AnyFunction[];
      arrayOfPrimitives: string[];
    };
  };
}

describe('jstub', () => {
  beforeEach(jest.resetAllMocks);

  const stubTestObject = jestStub<TestObject>();

  describe('stubbing', () => {
    test('should stub function correctly and set id', async () => {
      const number = faker.number.int();
      const id = faker.database.mongodbObjectId();

      stubTestObject.func.mockReturnValue(number);
      stubTestObject.id = id;

      const result = stubTestObject.func();

      expect(stubTestObject.id).toEqual(id);
      expect(stubTestObject.func).toHaveBeenCalledTimes(1);
      expect(result).toEqual(number);
    });

    test('should stub deep fields correctly', async () => {
      const anyString = faker.lorem.word();
      const anyString2 = faker.lorem.word();
      const anyString3 = faker.lorem.word();
      const number = faker.lorem.word();
      const id = faker.database.mongodbObjectId();

      stubTestObject.deep.deeper.deepFunction.mockReturnValue(anyString);
      stubTestObject.deep.deeper.arrayOfFunctions[0].mockReturnValue(anyString2);
      stubTestObject.deep.deeper.arrayOfFunctions[1].mockReturnValue(anyString3);

      stubTestObject.deep.deeper.arrayOfPrimitives[0] = number;
      stubTestObject.deep.deeper.arrayOfPrimitives[1] = id;

      expect(stubTestObject.deep.deeper.deepFunction()).toEqual(anyString);
      expect(stubTestObject.deep.deeper.deepFunction).toHaveBeenCalledTimes(1);

      expect(stubTestObject.deep.deeper.arrayOfFunctions[0]()).toBe(anyString2);
      expect(stubTestObject.deep.deeper.arrayOfFunctions[1]()).toBe(anyString3);

      expect(stubTestObject.deep.deeper.arrayOfPrimitives[0]).toBe(number);
      expect(stubTestObject.deep.deeper.arrayOfPrimitives[1]).toBe(id);
    });
  });
});
