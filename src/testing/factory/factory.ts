/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeepPartial, Factory as FisheryFactory, GeneratorFnOptions, GeneratorFn } from 'fishery';

/**
 * Factory will allow you to create objects easier.
 *
 * How to use: https://github.com/matheusicaro/matheusicaro-node-framework/tree/master?tab=readme-ov-file#factory
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
