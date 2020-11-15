# Extensions and `::` operator

## Proposal status

This is an ECMAScript (JavaScript) proposal in stage 0 and plan to be presented in next TC39 meeting.

Note: The proposal could be seen as the new iteration of old [bind operator proposal](https://github.com/tc39/proposal-bind-operator) and I hope we could continue the further development in the original proposal repo if possible. See https://github.com/tc39/proposal-bind-operator/issues/56 .

## Simple examples

### Example of ad-hoc extension methods and accessors
```js
// define two extension methods
const *::toArray = function () { return [...this] }
const *::toSet = function () { return new Set(this) }

// define a extension accessor
const *::allDivs = {
  get() { return this.querySelectorAll('div') }
}

// reuse prototype method and accessor
const *::flatMap = Array.prototype.flatMap
const *::size = Object.getOwnPropertyDescriptor(Set.prototype, 'size')

// Use extension methods and accesors to calculate
// the count of all classes of div element.
let classCount = document::allDivs
  ::flatMap(e => e.classList::toArray())
  ::toSet()::size
```

basically have the semantic as:

```js
// define two extension methods
const $toArray = function () { return [...this] }
const $toSet = function () { return new Set(this) }

// define a extension accessor
const $allDivs = {
  get() { return this.querySelectorAll('div') }
}

// reuse prototype method and accessor
const $flatMap = Array.prototype.flatMap
const $size = Object.getOwnPropertyDescriptor(Set.prototype, 'size')

// Use extension methods and accesors to calculate
// the count of all classes of div element.
let $
$ = $allDivs.get.call(document)
$ = $flatMap.call($, e => $toArray.call(e.classList))
$ = $toSet.call($)
$ = $size.get.call($)
let classCount = $
```

### Example of using constructors or namespace object as extensions

```js
// util.js
export const toArray = iterable => [...iterable]
export const toSet = iterable => new Set(iterable)
```

```js
import * as u from './util.js'

const *::allDivs = {
  get() { return this.querySelectorAll('div') }
}

let classCount = document::allDivs
  ::Array:flatMap(e => e.classList::u:toArray())
  ::u:toSet()
  ::Set:size
```

basically have the semantic as:

```js
import * as u from './util.js'

const *::allDivs = {
  get() { return this.querySelectorAll('div') }
}

let $
$ = $allDivs.get.call(document)
$ = EXT_INVOKE(Array, 'flatMap', $, [e => EXT_INVOKE(u, 'toArray', e.classList, [])])
$ = EXT_INVOKE(u, 'toSet', $, [])
$ = EXT_GET(Set, 'size', $)
let classCount = $

// abstract operations
function EXT_INVOKE(ext, name, thisArg, args) {
  let method = (IsConstructor(ext) ? ext.prototype : ext)[name]
  return Reflect.apply(method, thisArg, args)
}
function EXT_GET(ext, name, thisArg) {
  let {get} = Reflect.getOwnPropertyDescriptor(
    IsConstructor(ext) ? ext.prototype : ext, name)
  return Reflect.apply(get, thisArg)
}
```

## Change of the old bind operator proposal

- keep `obj::foo()` syntax for extension methods
- repurpose `obj::foo` as extension getters and add `obj::foo =` as extension setters
- separate namespace for ad-hoc extension methods and accessors, do not pollute normal binding names
- add `obj::ext:name` syntax
- change operator precedence to same as `.`
- remove `::obj.foo` (use cases can be solved by custom extension + library)
