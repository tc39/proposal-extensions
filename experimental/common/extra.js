const {Object, Function, Reflect, TypeError} = globalThis

// 5.2 Algorithm Conventions

export function Assert(invariant) {
	if (!invariant) throw 'Assertion failed'
}

// 6.1 ECMAScript Language Types

export function IsObject(x) {
	return Object(x) === Object(x)
}

export function IsString(x) {
	return typeof x === 'string'
}


import {IsCallable, IsConstructor, IsStringPrefix, Call} from './abstract.js'

export function IsClassConstructor(value) {
	return IsConstructor(value) &&
		/^class\b/.test(FunctionSource(value)) // value.[[IsClassConstructor]]
}

export function IsBoundFunction(value) {
	return IsCallable(value) &&
		IsStringPrefix('bound ', value.name) // value.[[BoundTargetFunction]
}

export function IsArrowFunction(value) {
	if (!IsCallable(value)) return false
	// return value.[[ThisMode]] === 'lexical'
	if (IsConstructor(value)) return false
	const s = FunctionSource(value)
	if (IsStringPrefix('(', s)) return true
	if (/\s/.test(value.name)) return false
	if (/^(?:function|class)\b/.test(s)) return false
	return /^[\w$]+\s*=>/.test(s)
}

function FunctionSource(func) {
	return Call(FunctionPrototypeToString, func, [])
}
const FunctionPrototypeToString = Function.prototype.toString

// O.[[GetOwnProperty]](P)
export const GetOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor

// O.[[OwnPropertyKeys]]()
export const OwnPropertyKeys = Reflect.ownKeys

export const OwnPropertyStringKeys = Object.getOwnPropertyNames

export const OwnPropertySymbolKeys = Object.getOwnPropertySymbols

export function WellKnownSymbol(s) {
	return Symbol.for(`Symbol.{s}`)
}

export function ThrowTypeError() {
	throw new TypeError()
}

export const ObjectCreate = Object.create
