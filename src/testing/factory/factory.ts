/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeepPartial, Factory as FisheryFactory, GeneratorFnOptions, GeneratorFn } from 'fishery';

/**
 * Factory will allow you to create objects easier.
 *
 * how to use?
 * ref: https://github.com/matheusicaro/matheusicaro-node-framework/blob/28-add-factory-builder-for-unit-tests/README.md#factory
 */
class Factory<T, I = unknown> extends FisheryFactory<T, I> {
  constructor(generatorFunction: (opts: GeneratorFnOptions<T, I, any>) => T) {
    super(generatorFunction);
  }

  static define<T, I = unknown, C = Factory<T, I>>(
    this: new (generator: GeneratorFn<T, I, any>) => C,
    generator: GeneratorFn<T, I, any>
  ): C {
    return new this(generator);
  }
}

export { Factory, DeepPartial };
