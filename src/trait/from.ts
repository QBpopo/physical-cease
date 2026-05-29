import type { StrictConstructor, Unwrap } from "../types.ts";

type Struct<Self = unknown> = StrictConstructor<Self>;
type Source<S = unknown> = StrictConstructor<S>;

const conflict_error = (struct: Struct, gen_param: Source): never => {
	throw new Error(`conflicting implementations of trait \`from<${gen_param.name}>\` for type \`${struct.name}\``);
};

const not_implemented_error = (struct: Struct, source: Source): never => {
	throw new Error(`the trait \`From<${source.name}>\` is not implemented for \`${struct.name}\``);
};

export type ImplFrom = <S, Self, US extends Unwrap<S> = Unwrap<S>>(
	gen_param: Source<S>,
	fn: (source: US) => Self,
) => void;

export type FnFrom<Self> = {
	<S>(value: Unwrap<S>): Self;
	<S>(gen_param: Source<S>, value: Unwrap<S>): Self;
};

const From = new WeakMap<Struct, WeakMap<Source, Function>>();

export const _use_trait_From =
	(_impl_From: PropertyKey, _from: PropertyKey) =>
	<Self>(struct: Struct<Self>) => {
		if (Object.hasOwn(struct, _impl_From) && Object.hasOwn(struct, _from)) {
			return struct;
		}

		const impls = From.get(struct) ?? From.set(struct, new WeakMap()).get(struct)!;

		const impl_From_fn: ImplFrom = (gen_param, fn) => {
			if (impls.has(gen_param)) {
				conflict_error(struct, gen_param);
			}
			impls.set(gen_param, fn);
		};

		const from_fn: FnFrom<Self> = <S>(...args: [Unwrap<S>] | [Source<S>, Unwrap<S>]): Self => {
			let source: Source<S>;
			let value: Unwrap<S>;

			if (args.length === 1) {
				value = args[0];
				source = Object.getPrototypeOf(value).constructor;
			} else {
				[source, value] = args;
			}

			const fn = impls.get(source);
			if (!fn) {
				return not_implemented_error(struct, source);
			}
			return fn(value);
		};

		const _struct = Object.assign(struct, {
			[_impl_From]: impl_From_fn,
			[_from]: from_fn,
		});

		impl_From_fn(struct, v => v);
		// same with `_struct[impl_From_fn](struct, v => v);` but tsc doesn't allow

		return _struct;
	};

export const from: unique symbol = Symbol("from");
export const impl_From: unique symbol = Symbol("impl_From");

export const use_trait_from_with_symbol = _use_trait_From(impl_From, from);
export const use_trait_from = _use_trait_From("impl_From", "from");
