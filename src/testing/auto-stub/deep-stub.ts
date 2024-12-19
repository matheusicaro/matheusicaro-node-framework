import { ArgumentTypes, Fn } from './common-types';

type Stub<T extends Fn> = jest.Mock<ReturnType<T>, ArgumentTypes<T>>;

type DeepStubValue<T> = T extends Fn
  ? Stub<T>
  : T extends Array<infer InferredArrayMember>
    ? Array<DeepStubValue<InferredArrayMember>>
    : T extends object
      ? DeepStubObject<T>
      : T;

/**
 * DeepStubObject will deep stub a interface or object, exe:
 *    - DeepStubValue<{ deep:{ more: deep: { end: { deep }} } }>
 *
 *  deep.more.deep.end.deep.
 *
 * how to use?
 * ref: https://github.com/matheusicaro/matheusicaro-node-framework/blob/28-add-factory-builder-for-unit-tests/README.md#deepstubobject
 */
export type DeepStubObject<T> = {
  [Key in keyof T]: DeepStubValue<T[Key]>;
};
