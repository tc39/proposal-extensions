import {Assert, GetOwnPropertyDescriptor, IsObject} from './extra.js'
const {Math, TypeError, Object, Number, String, Reflect} = globalThis

// 7.1 Type Conversion

// 7.1.5
export const ToIntegerOrInfinity = Math.floor

// 7.1.18
export function ToObject(argument) {
	if (argument === undefined || argument === null) throw new TypeError()
	return Object(argument)
}

// 7.1.20
export function ToLength(argument) {
	const n = ToIntegerOrInfinity(argument)
	if (n <= 0) return 0
	if (n >= MAX_SAFE_INTEGER) return MAX_SAFE_INTEGER
	return n
}
const {MAX_SAFE_INTEGER} = Number

// 7.2 Testing and Comparison Operations

// 7.2.1
export function RequireObjectCoercible(argument) {
	ToObject(argument)
	return argument
}

// 7.2.3
export function IsCallable(value) {
	return typeof value === 'function'
}

// 7.2.4
export function IsConstructor(value) {
	return IsCallable(value) && HasOwnProperty(value, 'prototype')
}

// 7.2.9
export function IsStringPrefix(p, q) {
	Assert(typeof p === 'string')
	Assert(typeof q === 'string')
	return Call(StringPrototypeStartsWith, q, [p])
}
const StringPrototypeStartsWith = String.prototype.startsWith

// 7.3 Operations on Objects

// 7.3.8
export const DefinePropertyOrThrow = Reflect.defineProperty

// 7.3.10
export function GetMethod(V, P) {
	const func = V[P]
	if (func === undefined || func === null) return undefined
	if (!IsCallable(func)) throw new TypeError()
	return func
}

// 7.3.12
export function HasOwnProperty(object, key) {
	return GetOwnPropertyDescriptor(object, key) !== undefined
}

// 7.3.13
export const Call = Reflect.apply

// 7.3.14
export const Construct = Reflect.construct
