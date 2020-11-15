import {
	Extension,
	ExtInvoke, ExtGet,
	CreateExtMethod, CallExtMethod, CallExtGetter, CallExtSetter
} from '../index.js'

const {assert, log} = console

{
	const x = {length: 2, 0: 'a', 1: 'b'}
	// const s = x::Array:join('/')
	const s = ExtInvoke(Array, 'join', x, ['/'])
	assert(s === 'a/b')
}
{
	const x = new Set(['a', 'b'])
	// const n = x::Set:size
	const n = ExtGet(Set, 'size', x)
	assert(n === 2)
}
{
	// const *::toHex = function () { return this.toString(16) }
	const $toHex = CreateExtMethod(function () { return this.toString(16) })
	// const hex = 255::toHex()
	const s = CallExtMethod($toHex, 255, [])
	assert(s === 'ff')
}
{
	// const *::hex = Extension.accessor(n => n.toString(16))
	const $hex = CreateExtMethod(Extension.accessor(n => n.toString(16)))
	// const hex = 255::hex
	const s = CallExtGetter($hex, 255)
	assert(s === 'ff')
}
{
	const who = {firstName: 'Shijun', lastName: 'He'}
	// const *::fullName = { ... }
	const $fullName = CreateExtMethod({
		get() {
			return this.firstName + ' ' + this.lastName
		},
		set(value) {
			[this.firstName, this.lastName] = value.split(' ')
		}
	})
	// const s = who::fullName
	const s = CallExtGetter($fullName, who)
	assert(s === 'Shijun He')
	// who::fullName = 'Shi-Jun HE'
	CallExtSetter($fullName, who, 'Shi-Jun HE')
	assert(who.lastName === 'HE')
}

log('tests ok.')
