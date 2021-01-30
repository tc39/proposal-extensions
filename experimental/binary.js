import {Call, ToObject, IsCallable} from './common/abstract.js'
import {ThrowTypeError, IsClassConstructor, IsBoundFunction, IsArrowFunction} from './common/extra.js'

// x::method(...args)  ->  CallExtMethod($method, x, args)
export function CallExtMethod(extensionMethod, thisArgument, argumentsList) {
	return Call(extensionMethod.invoke, thisArgument, argumentsList)
}

// x::prop  ->  CallExtGetter($prop, x)
export function CallExtGetter(extensionAccessor, thisArgument) {
	return Call(extensionAccessor.get, thisArgument, [])
}

// x::prop = value  ->  CallExtSetter($prop, x, value)
export function CallExtSetter(extensionAccessor, thisArgument, V) {
	Call(extensionAccessor.set, thisArgument, [V])
	return V
}

// const ::method = o  ->  $method = CreateExtMethod(o)
export function CreateExtMethod(O) {
	O = ToObject(O)
	if (IsCallable(O)) {
		CheckMethod(O)
		return {invoke: O}
	}
	const {get, set, value} = O
	if (get !== undefined || set !== undefined) {
		if (get !== undefined) CheckMethod(get)
		if (set !== undefined) CheckMethod(set)
		return {
			get, set,
			invoke(...args) {
				const f = Call(get, this)
				return Call(f, this, args)
			},
		}
	}
	CheckMethod(value)
	return {invoke: value}
}

function CheckMethod(F) {
	if (!IsCallable(F)) ThrowTypeError()
	if (IsArrowFunction(F) || IsBoundFunction(F)) ThrowTypeError()
	if (IsClassConstructor(F)) ThrowTypeError()
	// Optional: throw type error for other non-methods (functions ignore receiver)
}
