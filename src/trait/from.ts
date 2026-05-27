import type { StrictConstructor } from "../types.ts";

export const from: unique symbol = Symbol("from");
export const impl_from: unique symbol = Symbol("impl_from");

type Self<T> = StrictConstructor<T>;
type Source<S> = StrictConstructor<S>;
type FromFn<T, S> = (source: InstanceType<Source<S>>) => InstanceType<Source<T>>;

const conflict_error = <T, S>(self: Self<T>, source: Source<S>): never => {
	throw new Error(`conflicting implementations of trait \`from<${source.name}>\` for type \`${self.name}\``);
};

const not_implemented_error = <T, S>(self: Self<T>, source: Source<S>): never => {
	throw new Error(`the trait \`From<${source.name}>\` is not implemented for \`${self.name}\``);
};

export type ImplFrom = <S, T>(source: Source<S>, fn: FromFn<T, S>) => void;
export type FromFor<T> = <S>(source: Source<S>, value: S) => T;

const trait_from = new WeakMap<StrictConstructor, WeakMap<StrictConstructor, Function>>();

export const use_trait_from_with_symbol = <T>(self: Self<T>) => {
	const impls = trait_from.get(self) ?? trait_from.set(self, new WeakMap()).get(self)!;

	const _self = Object.assign(self, {
		[impl_from]: <S>(source: Source<S>, fn: FromFn<T, S>): void => {
			if (impls.has(source)) {
				conflict_error(self, source);
			}
			impls.set(source, fn);
		},
		[from]: function <S>(source: Source<S>, value: S): T {
			const fn = impls.get(source);
			if (!fn) {
				return not_implemented_error(self, source);
			}
			return fn(value);
		},
	});

	_self[impl_from](self, v => v);

	return _self;
};

export const use_trait_from = <T>(self: Self<T>) => {
	const _self = use_trait_from_with_symbol(self);
	return Object.assign(_self, {
		impl_from: _self[impl_from],
		from: _self[from],
	});
};
