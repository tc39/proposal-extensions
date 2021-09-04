# Use cases

## Borrow built-in methods

```js
value::Object:toString() // Object.prototype.toString.call(value)
```

---

```js
indexed::Array:map(x => x * x) // Array.prototype.map.call(indexed, x => x * x)
indexed::Array:filter(x => x > 0) // Array.prototype.filter.call(indexed, x => x > 0)
```

```js
const ::{map, filter} from Array

indexed::map(x => x * x)
indexed::filter(x => x > 0)
```

---

```js
const o = Object.create(null)

for (const key in o) {
	if (o.hasOwnProperty(key)) { // throw Error
		//...
	}
}
```

```js
const o = Object.create(null)

for (const key in o) {
	if (o::Object:hasOwnProperty(key)) { // Object.prototype.hasOwnProperty.call(o, key)
		//...
	}
}
```

```js
const ::{hasOwnProperty as own} from Object

const o = Object.create(null)

for (const key in o) {
	if (o::own(key)) {
		//...
	}
}
```


## Code readability

```js
// WebAssembly.instantiateStreaming(fetch('simple.wasm'))
fetch('simple.wasm')::WebAssembly:instantiateStreaming()
```

```js
// Math.abs(a.very.long.and.complex.expression)
a.very.long.and.complex.expression::Math:abs()
```

## CSS Unit

```js
1::CSS:px() // CSSUnitValue {value: 1, unit: "px"}
```

Note: Need small hack due to https://www.w3.org/Bugs/Public/show_bug.cgi?id=29623
```js
CSS[Symbol.extension] = Extension.from({...CSS})
```

```js
const ::px = Extension.accessor(CSS.px)
1::px // CSSUnitValue {value: 1, unit: "px"}
```

## [First-class protocols](https://github.com/michaelficarra/proposal-first-class-protocols)

```js
protocol Foldable {
	foldr
	toArray() {
		return this[Foldable.foldr](
			(m, a) => [a].concat(m), [])
	}
	get size() {
		return this[Foldable.foldr](m => m + 1, 0)
	}
	contains(eq, e) {
		return this[Foldable.foldr](
			(m, a) => m || eq(a, e),
			false)
	}
}

// assume iter.constructor implements Foldable
iter[Foldable.toArray]()
iter[Foldable.size]

// better syntax
iter::Foldable:toArray()
iter::Foldable:size

// if used frequently, could extact the extension methods/accessors
const ::{toArray, size} from Foldable

iter::toArray()
iter::size
```

```js
iter.constructor implements Foldable // true
iter[Foldable.toArray]()
iter[Foldable.size]

x.constructor implements Foldable // false
x[Foldable.toArray] = function () { ... }
x[Foldable.toArray]() // also ok
x[Foldable.size] // undefined

// ensure really implemented protocol
const ::{toArray, size} from Foldable
iter::toArray()
iter::size
x::toArray() // throw TypeError
x::size // throw TypeError
```

```js
protocol Foldable {
	foldr
	toArray() {
		return this[Foldable.foldr]((m, a) => [a].concat(m), [])
	}
	get size() {
		return this[Foldable.foldr](m => m + 1, 0)
	}
	contains(eq, e) {
		return this[Foldable.foldr]((m, a) => m || eq(a, e), false)
	}
}
```

Possible shorthand syntax

```js
protocol Foldable {
	foldr
	toArray() {
		return this::foldr((m, a) => [a].concat(m), [])
	}
	get size() {
		return this::foldr(m => m + 1, 0)
	}
	contains(eq, e) {
		return this::foldr((m, a) => m || eq(a, e), false)
	}
}
```


## Extract methods

```js
const f = obj.method.bind(obj)

// const f = ::obj.method
```

```js
const ::extractMethod = function (methodName) {
	return this[methodName].bind(this)
}

const foo = obj::extractMethod('method')
```

```js
const bind = {
	[Symbol.extension]: {
		get(receiver, name) {
			return receiver[name].bind(receiver)
		}
	}
}

const f = obj::bind:method // bind[Symbol.extension].get(obj, 'method')
```

```js
const get = {
	[Symbol.extension]: {
		get(receiver, name) {
			return () => receiver[name]
		}
	}
}
const set = {
	[Symbol.extension]: {
		get(receiver, name) {
			return (v) => receiver[name] = v
		}
	}
}

const getter = obj::get:prop
const setter = obj::set:prop
```

## Partial application

```js
const $ = Symbol('placeholder')
function pcall(f, ...args) {
	return x => f(...args.map(arg => arg === $ ? x : arg))
}

const reciprocal = pcall(div, 1, $)

function div(a, b) { return a / b }
```

```js
const ::pcall = Extension.method(particalCall)

const reciprocal = div::pcall(1, $) // div(1, ?)
```

```js
const pinvoke = {
	[Symbol.extension]: {
		invoke(receiver, name, args) {
			return x => receiver[name](...args.map(arg => arg === $ ? x : arg))
		}
	}
}

obj::pinvoke:foo(1, $) // obj.foo(1, ?)
```

## Pipe method

```js
const ::pipe = function (f) {
	return f(this)
}
let result = "hello"
	::pipe(doubleSay)
	::pipe(capitalize)
	::pipe(exclaim)
```

## await

```js
let result = await fetch("https://example.org/url").then(res => res.json())
let result = await (await fetch("https://example.org/url")).json()
```

```js
let result = "https://example.org/url"
	|> fetch
	|> await
	|> res => res.json()
	|> await
```

```js
let result = fetch("https://example.org/url")::await().json()::await()
```

```js
value::await() // possible solution of top-level await in script
```

## throw

```js
valid ? 42 : throw new TypeError() // throw expressions
valid ? 42 : new TypeError()::throw()
```

## new

```js
let a = new (unsigned ? Uint8Array : Int8Array)(4)
```

```js
let a = (unsigned ? Uint8Array : Int8Array)::new(4)
```

# Pipeline
```js
value
|> await #
|> doubleSay(#, ', ')
|> capitalize // This is a function call.
|> # + '!'
|> new User.Message(#)
|> await #
|> console.log; // This is a method call.
```

```js
value
	::await()
	::pipe(doubleSay, $, ', ')
	::pipe(capitalize)
	::pipe(s => s + '!')
	::pipe(User.Message)
	::await()
	::pipe(s => console.log(s))
```

```js
value
	::await()
	::pipe(doubleSay, $, ', ')
	::pipe(capitalize)
	::String:concat('!')
	::pipe(User.Message)
	::await()
	::console:log()
```


## Sensitive code (use Branding as example)

```js
// Could be hijacked by modifying `WeakSet.prototype`!

const brand = new WeakSet()

function installBrand(o) {
	brand.add(o)
}

function checkBrand(o) {
	return brand.has(o)
}
```


```js
// Inconvenient syntax
// Could be hijacked by modifying `Function.prototype.call`!

const {has, add} = WeakSet.prototype
const brand = new WeakSet()

function installBrand(o) {
	add.call(brand, o)
}

function checkBrand(o) {
	return has.call(brand, o)
}
```

```js
// Inconvenient syntax

const call = Reflect.apply
const {has, add} = WeakSet.prototype
const brand = new WeakSet()

function installBrand(o) {
	call(add, brand, o)
}

function checkBrand(o) {
	return call(has, brand, o)
}
```


```js
// must remember adding new methods
// how about accessors?

const brand = new WeakSet()
brand.add = WeakSet.prototype.add
brand.has = WeakSet.prototype.has

function installBrand(o) {
	brand.add(o)
}

function checkBrand(o) {
	return brand.has(o)
}
```

Simple solution:

```js
const ::{has, add} from WeakSet
const brand = new WeakSet()

function installBrand(o) {
	brand::add(o)
}

function checkBrand(o) {
	return brand::has(o)
}
```

## Internal slot

```js
function Slot() {
	const store = new WeakMap()
	return {
		get() {
			if (!store.has(this)) throw new TypeError()
			return store.get(this)
		},
		set(v) {
			if (!store.has(this)) throw new TypeError()
			store.set(this, v)
		},
		install() {
			if (store.has(this)) throw new TypeError()
			store.set(this, undefined)
		},
	}
}

function createObjectWithSlots(proto, slots) {
	const o = Object.create(proto)
	for (const slot of slots) o::slot:install()
	return o
}

const foobarSlots = [Slot(), Slot()]
const ::[foo, bar] = foobarSlots
const ::foobar = function () {
	return this::foo + this::bar
}

let o = createObjectWithSlots({}, foobarSlots)
o::foo = 40
o::bar = 2
console.log(o::foo, o::bar, o::foobar()) // 40, 2, 42
```

Symbol group

```js
const A = SymbolGroup()
const ::{a1, a2} = A.accessors()
const B = SymbolGroup()
const ::{b1} = B.accessors()

class Test {
	constructor(foo, bar) {
		this::A:init({foo, bar})
	}
	foobar() {
		return this::foo + this::bar
	}
}

const x = new Test(1, 2)
x.foobar() // 3

x::foo = 40
x.foobar() // 42

const y = {}
y::foo = 1 // throw
```

Property access

```js
const key = new Extension({
	get(receiver, key) {
		if (!(key in receiver)) throw new TypeError()
		return receiver[key]
	},
	set(receiver, key, value) {
		if (!(key in receiver)) throw new TypeError()
		receiver[key] = value
	},
})

const o = {x: 1, y: 2}
o::key:x // 1
++o::key:y // 3
o::key:z // throw TypeError
```



## Eventual Send

```js
// https://github.com/tc39/proposal-eventual-send

// E and E.sendOnly convenience proxies
import { E } from 'js:eventual-send';

// Invoke pipelined RPCs.
const fileP = E(
	E(target).openDirectory(dirName)
).openFile(fileName);
// Process the read results after a round trip.
E(fileP).read().then(contents => {
	console.log('file contents', contents);
	// We don't use the result of this send.
	E.sendOnly(fileP).append('fire-and-forget');
});
```

```js
// Invoke pipelined RPCs.
const fileP = HandledPromise.applyMethod(
	HandledPromise.applyMethod(target, 'openDirectory', [dirName]),
	'openFile', [filename])
// Process the read results after a round trip.
HandledPromise.applyMethod(fileP, 'read', []).then(contents => {
	console.log('file contents', contents);
	// We don't use the result of this send.
	HandledPromise.applyMethodSendOnly(fileP, 'append', ['fire-and-forget'])
});
```

- need better syntax
- need two type of Proxy to differentiate `get` and `applyMethod`

```js
// https://github.com/tc39/proposal-wavy-dot
const fileP = target
	~.openDirectory(dirName)
	~.openFile(fileName)
// Process the read results after a round trip.
fileP~.read().then(contents => {
	console.log('file contents', contents)
	// We don't use the result of this send.
	fileP~.append('fire-and-forget')
})
```

```js
const send = new Extension({
	apply(receiver, key, args) {
		return HandledPromise.applyMethod(receiver, key, args)
	},
	get(receiver, key) {
		return HandledPromise.get(receiver, key)
	},
	set(receiver, key, value) {
		return HandledPromise.set(receiver, key, value)
	},
})
const sendOnly = new Extension({
	apply(key, args) {
		return HandledPromise.applyMethodSendOnly(this, key, args)
	},
	get(key) {
		return HandledPromise.getSendOnly(this, key)
	},
	set(key, value) {
		return HandledPromise.setSendOnly(this, key, value)
	},
})

// Invoke pipelined RPCs.
const fileP = target
	::send:openDirectory(dirName)
	::send:openFile(fileName)
// Process the read results after a round trip.
fileP::send:read().then(contents => {
	console.log('file contents', contents)
	// We don't use the result of this send.
	fileP::sendOnly:append('fire-and-forget')
})
```

- Not as concise as special operator, but still elegant
- Save the syntax space
