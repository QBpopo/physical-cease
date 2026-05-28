export type StrictFunction<T = unknown> = (...args: never) => T;
export type StrictConstructor<T = unknown> = new (...args: never) => T;

export type DataFields<T> = Pick<T, { [K in keyof T]: T[K] extends StrictFunction ? never : K }[keyof T]>;

/* oxlint-disable typescript/no-wrapper-object-types */
type UnwrapNumber<T> = T extends Number ? number : T;
type UnwrapString<T> = T extends String ? string : T;
type UnwrapBoolean<T> = T extends Boolean ? boolean : T;
type UnwrapSymbol<T> = T extends Symbol ? symbol : T;
type UnwrapBigInt<T> = T extends BigInt ? bigint : T;
/* oxlint-enable typescript/no-wrapper-object-types */

export type Unwrap<T> = UnwrapNumber<UnwrapString<UnwrapBoolean<UnwrapSymbol<UnwrapBigInt<T>>>>>;
