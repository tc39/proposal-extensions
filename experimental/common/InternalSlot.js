import { Call } from './abstract.js'
import { ThrowTypeError } from './extra.js'

const {WeakMap} = globalThis
const {has, get, set} = WeakMap.prototype

export default function InternalSlot() {
	const wm = new WeakMap()
	const wm_has = k => Call(has, wm, [k])
	const wm_get = k => Call(get, wm, [k])
	const wm_set = (k, v) => Call(set, wm, [k, v])
	return {
		install(object, value) {
			Assert(!wm_has(object))
			wm_set(object, value)
		},
		has(object) {
			return wm_has(object)
		},
		get(object) {
			if (!wm_has(object)) ThrowTypeError()
			return wm_get(object)
		},
		set(object, value) {
			if (!wm_has(object)) ThrowTypeError()
			wm_set(object, value)
		},
	}
}
