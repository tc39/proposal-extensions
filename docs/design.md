# Design

This proposal introduce `::` (double colon) infix notation which the left side is an expression and the right side could be either a simple identifier or two identifiers separated by `:` (single colon). `::` has the same precedence of `.` (member access) operator.

This proposal also introduce a new global `Extension` function object and a new well-known symbol `Symbol.extension`.

## `x::name` (ad-hoc extension methods and accessors)

```js
// declare a ad-hoc extension method/accessor
const *::method = func
const *::prop = {get: getter, set: setter}

// use ad-hoc extension methods and accessors
x::method(...args)
x::prop
x::prop = value
```
roughly equals to
```js
const $method = CreateExtMethod(func, '*')
const $prop = CreateExtMethod({get: getter, set: setter}, '*')

CallExtMethod($method, x, args)  // Call(func, x, args)
CallExtGetter($prop, x)          // Call(getter, x, [])
CallExtSetter($prop, x, value)   // Call(setter, x, [value])
```

See [experimental implementation](experimental/binary.js) for details.

## `x::ext:name`

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

See [experimental implementation](experimental/ternary.js) for details.

## `Extension` API

```js
class Extension {
	constructor(extensionMethods)
	static from(object)
}
```

See [experimental implementation](experimental/Extension.js) for details.

## Follow-on proposals

### Static helper methods of `Extension`

```js
// doesn't work
const *::cube = x => x ** 3
const *::sqrt = Math.sqrt
```
```js
// work
const *::cube = function () {
	return this ** 3
}
const *::sqrt = function () {
	return Math.sqrt(this)
}
```

```js
// Use Extension.method helper
const *::cube = Extension.method(x => x ** 3)
2::cube() // 8

// Use Extension.accessor helper
const *::sqrt = Extension.accessor(Math.sqrt)
9::sqrt // 3
```

### Declare/import multiple ad-hoc extension methods and accessors

```js
const *::{x, y as x1} from value
```
work as
```js
const $ext = Extension.from(value)
const *::x = ExtensionGetMethod($ext, 'x')
const *::x1 = ExtensionGetMethod($ext, 'y')
```

```js
import *::{x, y as x1} from 'mod'
```
work as
```js
import * as $mod from 'mod'
const *::{x, y as x1} from $mod
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
