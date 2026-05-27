export type StrictFunction<T = unknown> = (...args: never) => T;
export type StrictConstructor<T = unknown> = new (...args: never) => T;

export type DataFields<T> = Pick<T, { [K in keyof T]: T[K] extends StrictFunction ? never : K }[keyof T]>;
