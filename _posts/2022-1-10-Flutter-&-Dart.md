---
layout: post
title: Flutter & Dart
tags: [flutter, dart]
---

### const和final

他们干同样的事情，即变量定义后不可修改，但是final应用的场景更多一些。const只能用在top-level，static，local variables。函数里的变量OK，class里的成员变量就不能简单的用`const int v = 4`这样的句子，只能`static const`，所以如果只是定义一个变量，那就用final就好了，可以不用考虑一些乱七八糟的事情。

```dart
void main() {
  final fvar = 'helloworld';
  const cvar = 'helloworld';
}
```

看起来没什么区别，但是在编译器看起来，有很大的不同，const是baked into the code，他们不会在运行时被计算。final是在运行时赋值，而const是在编译时赋值。

在flutter中，比如像创建一个Padding(prop: somevalue)之类的对象，你可能到处会用到同样的对象，这个时候Padding(prop: const somevalue)，加上const，这个实例就能被reuse，这叫做所谓的canonical instance。

要实现这种效果，Padding的构造函数要用const修饰。

```dart
class Person {
  final String name;
  final int age;
  
  const Person(this.name, this.age);
}

void main() {
  final fname = 'kobe';
  const cname = 'tim';
  
  const p = Person(cname, 23);
  const p1 = Person(fname, 23);  // Error
}
```

注意下面两种方式：

```dart
final p = const Person(cname, 23);
final p = Person(cname, 23);
final p = new Person(cname, 23);
```

如果不指定const的话，会创建一个new instance，而不是const instance，下面两种是一样的。所以尽量使用const来进行一些小的性能提升。
