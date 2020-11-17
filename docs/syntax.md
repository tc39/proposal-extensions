# Syntax Consideration

## Alternative syntax for ad-hoc extension methods/accessors declaration

### Alternative 1

```js
// explicit receiver parameter
const iterable::toArray() {
	return [...iterable]
}

const indexed::last {
	// accessor group syntax
	get() { return indexed[indexed.length - 1]}
	set(v) { indexed[indexed.length - 1] = v }
}

// use `*` as placeholder of receiver, could also consider `_` or `?`, etc.
const *::map = Array.prototype.map
const *::size = Object.getOwnPropertyDescriptor(Set.prototype, 'size')
```

Issue: can't find satisfying syntax for TypeScript.

### Alternative 2

```js
// align with possible future const function syntax
const ::toArray() {
	return [...this]
}

const ::last {
	// accessor group syntax
	get() { return this[this.length - 1] }
	set(v) { this[this.length - 1] = v }
}

// no change
const ::map = Array.prototype.map
const ::size = Object.getOwnPropertyDescriptor(Set.prototype, 'size')
```

TypeScript:
```ts
const ::toArray<T>(this: Iterable<T>): T[] {
	return [...this]
}

const ::last<T> {
	get(this: T[]): T { return this[this.length - 1] }
	set(this: T[], v: T) { this[this.length - 1] = v }
}

const ::map = Array.prototype.map // infer type
const ::size = Object.getOwnPropertyDescriptor(Set.prototype, 'size') as { get(this: Set): number }
```


## Syntax ambiguity of `A::B:C`

There are two rules to help to mitigate the ambiguity of using `A::B:C` with `? ... :` or `case ... :` .

1. Newline is not allowed around `:` in `A::B:C`, aka. `B : C` must be in the same line. So
	```js
	let x = foo
		? A::B
		: C
	```
	and
	```js
	case A::B:
		C
	```
	will work as developer expected.
2. `A::B:C` has the higher precedence, so `foo ? A :: B : C` will always be parsed as `foo ? (A::B:C)`, not `foo ? (A::B) : C`; `case A :: B : C` will always be parsed as `case (A::B:C)`, not `case (A::B): C`.
  Alternative 1: do not allow spaces between `:` and `C`, so `foo ? A::B : C` and `case A::B: C` will work as developer expect.
  Alternative 2: make `foo ? A :: B : C` or `case A :: B : C` be syntax error and force programmers use parens in such cases.

Another alternative is replacing `:` to other character. It can't be any exist binary operator. Unary operators `!` or `~` could be reused, though it will make them not available for potential overload for binary operator.

```js
x::Ext:name

x::Ext~name
x::Ext!name

x::Ext#name
x::Ext@name

x::Ext'name
x::Ext"name
```
