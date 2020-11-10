# Extensions in other programming languages

## What is Extensions?

[Extensions](https://en.wikipedia.org/wiki/Extension_method) is a feature many programming languages introduced in recent years, especially the new languages Swift/Kotlin/Dart.

It allows the developers adding methods to built-in libraries and 3rd-party libraries statically and locally (not monkey patch), and also provide a new way to organize the code. Some programming languages already use Extensions to envlove their standard libraries.

The main difference of Extensions of other programming languages with Extensions of JavaScript (aka. this proposal) is, this proposal use a individul operator `::` instead of overloading `.` operator, see [syntax](syntax.md) for further discussion. A consequence of that is this proposal has a very simple semantic of method dispatching instead of complex resolve mechanism.

### History of adoption of Extensions or similar features in the programming languages

- 2003: Classboxes [Classboxes](http://scg.unibe.ch/research/classboxes),
	[paper](http://scg.unibe.ch/archive/papers/Berg03aClassboxes.pdf)
- 2007: C# 3.0+ [Extension methods](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods)
	(and possible future [extension properties](https://stackoverflow.com/questions/619033/does-c-sharp-have-extension-properties),
	[issue](https://github.com/dotnet/csharplang/issues/192))
- 2007: VB.NET 9.0+ [Extension Methods](https://docs.microsoft.com/en-us/dotnet/visual-basic/programming-guide/language-features/procedures/extension-methods)
- [2010](https://bugs.ruby-lang.org/issues/4085), 2013: Ruby 2.0+ [Refinements (local class extensions)](https://bugs.ruby-lang.org/projects/ruby-master/wiki/RefinementsSpec)
- 2011: Kotlin [Extensions](https://kotlinlang.org/docs/reference/extensions.html)
- 2012: Lombok v0.11.2+ [Extension Method](https://projectlombok.org/features/experimental/ExtensionMethod)
- 2013: Haxe 3+ [Static Extension](https://haxe.org/manual/lf-static-extension.html)
- 2013: Scala 2.10+ [Implicit Classes](https://docs.scala-lang.org/overviews/core/implicit-classes.html)
- 2014: Gosu [Enhancements](https://gosu-lang.github.io/docs.html#enhancements)
- 2014: Swift [Extensions](https://docs.swift.org/swift-book/LanguageGuide/Extensions.html)
- ?: Eclipse Xtend [Extension Methods](http://www.eclipse.org/xtend/documentation/202_xtend_classes_members.html#extension-methods)
- 2017?: Manifold [Java Extensions](https://github.com/manifold-systems/manifold/tree/master/manifold-deps-parent/manifold-ext#extension-classes-via-extension)
- 2019: Dart 2.7+ [Extension Methods](https://dart.dev/guides/language/extension-methods)
- ?: Dotty (Scala 3) [Extension Methods](https://dotty.epfl.ch/docs/reference/contextual/extension-methods-new.html)

### C#

[C# Extension methods](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods)

```csharp
using System.Linq;
using System.Text;
using System;

namespace CustomExtensions
{
    // Extension methods must be defined in a static class.
    public static class StringExtension
    {
        // This is the extension method.
        // The first parameter takes the "this" modifier
        // and specifies the type for which the method is defined.
        public static int WordCount(this String str)
        {
            return str.Split(new char[] {' ', '.','?'}, StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }
}
namespace Extension_Methods_Simple
{
    // Import the extension method namespace.
    using CustomExtensions;
    class Program
    {
        static void Main(string[] args)
        {
            string s = "The quick brown fox jumped over the lazy dog.";
            // Call the method as if it were an
            // instance method on the type. Note that the first
            // parameter is not specified by the calling code.
            int i = s.WordCount();
            System.Console.WriteLine("Word count of s is {0}", i);
        }
    }
}
```

### Swift

[Swift Extensions](https://docs.swift.org/swift-book/LanguageGuide/Extensions.html)

```swift
extension Int {
    var simpleDescription: String {
        return "The number \(self)"
    }
}
print(7.simpleDescription)
// Prints "The number 7"
```

### Kotlin

[Kotlin Extensions](https://kotlinlang.org/docs/reference/extensions.html)

```kt
open class Shape

class Rectangle: Shape()

fun Shape.getName() = "Shape"

fun Rectangle.getName() = "Rectangle"

fun printClassName(s: Shape) {
    println(s.getName())
}

printClassName(Rectangle())
```

### Scala

[Scala Implicits](https://docs.scala-lang.org/overviews/core/implicit-classes.html)

```scala
object Helpers {
  implicit class IntWithTimes(x: Int) {
    def times[A](f: => A): Unit = {
      def loop(current: Int): Unit =
        if(current > 0) {
          f
          loop(current - 1)
        }
      loop(x)
    }
  }
}
```

```scala
import Helpers._
5 times println("HI")
```

### Dart

[Dart Extension methods](https://dart.dev/guides/language/extension-methods)

```dart
extension NumberParsing on String {
  int parseInt() {
    return int.parse(this);
  }
  // ···
}
```

```dart
import 'string_apis.dart';
// ···
print('42'.parseInt()); // Use an extension method.
```

### Ruby

[Ruby Refinements](https://bugs.ruby-lang.org/projects/ruby-master/wiki/RefinementsSpec)

```ruby
class C
  def foo
    puts "C#foo"
  end
end

module M
  refine C do
    def foo
      puts "C#foo in M"
    end
  end
end
```

```ruby
using M
x = C.new
c.foo #=> C#foo in M
```

## The discussion of introducing Extensions in TypeScript

- https://github.com/microsoft/TypeScript/issues/9
