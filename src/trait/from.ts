import type { StrictConstructor, Unwrap } from "../types.ts";

export const from: unique symbol = Symbol("from");
export const impl_from: unique symbol = Symbol("impl_from");

type Self<T> = StrictConstructor<T>;
type Source<S> = StrictConstructor<S>;

const conflict_error = <T, S>(self: Self<T>, source: Source<S>): never => {
	throw new Error(`conflicting implementations of trait \`from<${source.name}>\` for type \`${self.name}\``);
};

const not_implemented_error = <T, S>(self: Self<T>, source: Source<S>): never => {
	throw new Error(`the trait \`From<${source.name}>\` is not implemented for \`${self.name}\``);
};

export type ImplFrom = <S, T, Arg extends Unwrap<S> = Unwrap<S>>(source: Source<S>, fn: (source: Arg) => T) => void;

type _ImplFromFor<T> = <S>(value: Unwrap<S>) => T;
type __ImplFromFor<T> = <S>(source: Source<S>, value: Unwrap<S>) => T;
export type ImplFromFor<T> = _ImplFromFor<T> & __ImplFromFor<T>;

const trait_from = new WeakMap<StrictConstructor, WeakMap<StrictConstructor, Function>>();

export const use_trait_from_with_symbol = <T>(self: Self<T>) => {
	const impls = trait_from.get(self) ?? trait_from.set(self, new WeakMap()).get(self)!;

	const impl_from_fn: ImplFrom = (source, fn) => {
		if (impls.has(source)) {
			conflict_error(self, source);
		}
		impls.set(source, fn);
	};

	const _from_fn: _ImplFromFor<T> = value => {
		const source = Object.getPrototypeOf(value).constructor;
		return __from_fn(source, value);
	};

	const __from_fn: __ImplFromFor<T> = (source, value) => {
		const fn = impls.get(source);
		if (!fn) {
			return not_implemented_error(self, source);
		}
		return fn(value);
	};

	const from_fn: __ImplFromFor<T> = (source, value) => {
		if (value === undefined) {
			return _from_fn(source);
		} else {
			return __from_fn(source, value);
		}
	};

	const _self = Object.assign(self, {
		[impl_from]: impl_from_fn,
		[from]: from_fn,
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
