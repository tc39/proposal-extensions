import {Call, ToObject, IsConstructor, HasOwnProperty} from './common/abstract.js'
import {WellKnownSymbol, GetOwnPropertyDescriptor, ThrowTypeError} from './common/extra.js'

// x::ext:name(...args) -> ExtInvoke(ext, 'name', x, args)
export function ExtInvoke(O, name, thisArgument, argumentsList) {
	const ext = GetExtension(O)
	const {invoke} = ext
	if (invoke !== undefined) {
		return Call(invoke, ext, [thisArgument, name, argumentsList, O])
	}
	const f = ext.get(thisArgument, name, O)
	return Call(f, thisArgument, argumentsList)
}

// x::ext:name -> ExtGet(ext, 'name', x, [])
export function ExtGet(O, name, thisArgument) {
	const ext = GetExtension(O)
	return ext.get(thisArgument, name, O)
}

// x::ext:name = value -> ExtSet(ext, 'name', x, value)
export function ExtSet(O, name, thisArgument, V) {
	const ext = GetExtension(O)
	ext.set(thisArgument, name, V, O)
	return V
}

export const SymbolExtension = WellKnownSymbol('extension')

function GetExtension(O) {
	const ext = O[SymbolExtension]
	if (ext !== undefined) return ToObject(ext)
	if (IsConstructor(O)) {
		ToObject(O.prototype)
		return ConstructorExtension
	}
	// for first-class protocol proposal
	// if (IsProtocol(value)) return ProtocolExtension
	return NamespaceExtension
}

const ConstructorExtension = {
	get [SymbolExtension]() { return this },
	invoke(receiver, name, args, C) {
		const {value, get} = GetOwnPropertyDescriptor(C.prototype, name)
		if (value !== undefined) return Call(value, receiver, args)
		const f = Call(get, receiver)
		return Call(f, receiver, args)
	},
	get(receiver, name, C) {
		const {get} = GetOwnPropertyDescriptor(C.prototype, name)
		return Call(get, receiver, [])
	},
	set(receiver, name, V, C) {
		const {set} = GetOwnPropertyDescriptor(C.prototype, name)
		return Call(set, receiver, V)
	},
}

const NamespaceExtension = {
	get [SymbolExtension]() { return this },
	invoke(receiver, name, args, O) {
		if (!HasOwnProperty(O, name)) ThrowTypeError()
		return O[name](receiver, ...args)
	},
}
