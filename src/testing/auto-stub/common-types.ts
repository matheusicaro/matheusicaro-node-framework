/* eslint-disable @typescript-eslint/no-explicit-any */

export type TrapsType = {
  get(target: any, prop: string, _receiver: any): any;
  has(target: any, prop: string): boolean;
};

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>>
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P];
};

export type Fn = (...args: any[]) => any;

export type ArgumentTypes<F extends Fn> = F extends (...args: infer A) => any ? A : never;
