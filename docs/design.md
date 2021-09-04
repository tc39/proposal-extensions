# Design

This proposal introduce `::` (double colon) infix notation which the left side is an expression and the right side could be either a simple identifier or two identifiers separated by `:` (single colon). `::` has the same precedence of `.` (member access) operator.

This proposal also introduce a new global `Extension` function object and a new well-known symbol `Symbol.extension`.

## `x::name` (ad-hoc extension methods and accessors)

### Usage

Declare a ad-hoc extension method and use it:
```js
const ::last = function () {
	return this[this.length - 1]
}

[1, 2, 3]::last() // 3
```

Like normal const declarations, ad-hoc extension methods are also
lexical:

```js
let x = 'x'

const ::foo = function () { return `${this}@outer` }

x::foo() // 'x@outer'

{
	// TDZ here
	// x::foo()

	const ::foo = function () { return `${this}@inner` }

	x::foo() // 'x@inner'
}
```

Ad-hoc extension accessors:

```js
const ::last = {
	get() { return this[this.length - 1] },
	set(v) { this[this.length - 1] = v },
}

let x = [1, 2, 3]
x::last // 3
x::last = 10
x // [1, 2, 10]
x::last++
x // [1, 2, 11]
```

`a::b` have the same precedence of `a.b`, so they can be chained seamlessly:

```js
document.querySelectorAll('.note')
	::filter(x => x.textContent.include(keyword))
	.map()
```



### Transpile

```js
// declare a ad-hoc extension method/accessor
const ::method = func
const ::prop = {get: getter, set: setter}

// use ad-hoc extension methods and accessors
x::method(...args)
x::prop
x::prop = value
```
could be transpile to
```js
const $method = CreateExtMethod(func)
const $prop = CreateExtMethod({get: getter, set: setter})

CallExtMethod($method, x, args)  // Call(func, x, args)
CallExtGetter($prop, x)          // Call(getter, x)
CallExtSetter($prop, x, value)   // Call(setter, x, [value])
```

See [experimental implementation](../experimental/binary.js) for details.

## `x::ext:name` (extension)

```js
x::O:method(...args)
x::O:prop
x::O:prop = value
```
roughly equals to
```js
Call(GetOwnProperty(O.prototype, 'prop').value, x, args)
Call(GetOwnProperty(O.prototype, 'prop').get, x)
Call(GetOwnProperty(O.prototype, 'prop').set, x, [value])
```

If `O` is not a constructor, `x::O:func(...args)` roughly equals to `O.func(x, ...args)`.

The behavior can also be customized by `Symbol.extension`.

See [experimental implementation](../experimental/ternary.js) for details.

## `Extension` API

```js
class Extension {
	constructor(extensionMethods)
	static from(object)
}
```

See [experimental implementation](../experimental/Extension.js) for details.

## Extra features (could be split to follow-on proposals)

### Static helper methods of `Extension`

```js
// doesn't work
const ::cube = x => x ** 3
const ::sqrt = Math.sqrt
```
```js
// work
const ::cube = function () {
	return this ** 3
}
const ::sqrt = function () {
	return Math.sqrt(this)
}
```

```js
// Use Extension.method helper
const ::cube = Extension.method(x => x ** 3)
2::cube() // 8

// Use Extension.accessor helper
const ::sqrt = Extension.accessor(Math.sqrt)
9::sqrt // 3
```

`Extension.method` and `Extension.accessor` also accept the extra options argument.

Programmers could use `"receiver"` option to indicate how to deal with the receiver.

```js
// Define ::max extension accessor
const ::max = Extension.accessor(Math.max, {receiver: 'spread'});
// spread the receiver, so `receiver::max` work as `Math.max(...receiver)`

[1, 2, 3]::max // 3
```

The valid values of `"receiver"` option:
#### `'first'` (default)
`Extension.method(f, {receiver: 'first'})` behave like
```js
function (...args) { return f(this, ...args) }
```
####  `'last'`
`Extension.method(f, {receiver: 'last'})` behave like
```js
function (...args) { return f(...args, this) }
```
####  `'spread first'` or `'first spread'` or `'spread'`
`Extension.method(f, {receiver: 'spread first'})` behave like 
```js
function (...args) { return f(...this, ...args) }
```
####  `'spread last'` or `'last spread'`
`Extension.method(f, {receiver: 'spread last'})` behave like 
```js
function (...args) { return f(...args, ...this) }
```

### Declare/import multiple ad-hoc extension methods and accessors

```js
const ::{x, y as x1} from value
```
work as
```js
const $ext = Extension.from(value)
const ::x = ExtensionGetMethod($ext, 'x')
const ::x1 = ExtensionGetMethod($ext, 'y')
```
And
```js
import ::{x, y as x1} from 'mod'
```
work as
```js
import * as $mod from 'mod'
const ::{x, y as x1} from $mod
```

### Optional chaining

```js
x?::extMethod()
x?::ext:method()
```

work as

```js
x === null || x === undefined ? undefined : x::extMethod()
x === null || x === undefined ? undefined : x::ext:method()
```

## Other possible features

### in-place extension methods/accessors

Just like dot notation `obj.prop` has corresponding bracket notation `obj[computedProp]`, we could also introduce similar syntax for extension methods/accessors.

```js
x::[expression]
```
work as
```js
const ::$extMethodOrAccessor = expression
x::$extMethodOrAccessor
```

Currently the author of the proposal feel this syntax do not very useful, so not include it. If there are strong use cases, we could add it back.
