/* eslint-disable @typescript-eslint/no-explicit-any */
import { Factory, faker } from '../../../src/testing';

type ExampleTest = {
  id: string;
  name: string;
  date: Date;
  number: number;
  array: any[];
  obj: Record<string, unknown>;
};

const defaultValues = {
  id: faker.database.mongodbObjectId(),
  date: faker.date.recent(),
  name: faker.person.firstName(),
  number: faker.number.int(),
  array: [{ prop1: 'any', prop2: ['any'] }],
  obj: { prop1: 'any', prop2: ['any'] }
};

const exampleTestFactory = Factory.define<ExampleTest>(() => defaultValues);

describe('Factory', () => {
  describe('build', () => {
    test('should build the default values from the type passed', () => {
      const generatedObject = exampleTestFactory.build();

      expect(generatedObject.id).toEqual(defaultValues.id);
      expect(generatedObject.date).toEqual(defaultValues.date);
      expect(generatedObject.name).toEqual(defaultValues.name);
      expect(generatedObject.number).toEqual(defaultValues.number);
      expect(generatedObject.obj).toEqual(defaultValues.obj);
      expect(generatedObject.array).toEqual(defaultValues.array);
    });

    test('should build the override values when passed', () => {
      const override = {
        array: [''],
        date: new Date(),
        id: 'id',
        name: 'name',
        number: 10,
        obj: { prop1: 'another value', prop2: [] }
      };

      const generatedObject = exampleTestFactory.build(override);

      expect(generatedObject.id).toEqual(override.id);
      expect(generatedObject.date).toEqual(override.date);
      expect(generatedObject.name).toEqual(override.name);
      expect(generatedObject.number).toEqual(override.number);
      expect(generatedObject.obj).toEqual(override.obj);
      expect(generatedObject.array).toEqual(override.array);
    });
  });

  describe('extends the factory for custom field builders', () => {
    /**
     * The factory can extended for building the custom methods for specific fields...
     * This can be done for any field in the object as example here ExampleTest
     */
    class ExampleTestFactory extends Factory<ExampleTest> {
      oldDate() {
        return this.params({
          date: new Date('2000-01-15T14:17:13.417Z')
        });
      }
    }

    const exampleTestFactory = ExampleTestFactory.define(() => defaultValues);

    test('should build specific values when the factory has a custom builder', () => {
      const generatedObject = exampleTestFactory.oldDate().build();

      expect(generatedObject.date.toJSON()).toEqual('2000-01-15T14:17:13.417Z');
      expect(generatedObject.id).toEqual(defaultValues.id);
      expect(generatedObject.name).toEqual(defaultValues.name);
      expect(generatedObject.number).toEqual(defaultValues.number);
      expect(generatedObject.obj).toEqual(defaultValues.obj);
      expect(generatedObject.array).toEqual(defaultValues.array);
    });
  });
});
