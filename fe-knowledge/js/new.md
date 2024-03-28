# new 做了什么

创建一个新的实例

- 可访问构建函数的属性
- 可访问构建函数 prototype 上的属性

# 实现一个 new

```js
function objectFactory() {
  const Constructor = Array.prototype.shift.call(arguments);
  const object = Object.create(Constructor.prototype);
  const res = Constructor.apply(object, arguments);
  return res instanceof Object ? res : object;
}
```

# new 与 Object.create 的区别

- new 关键字创建的对象是 Object 的实例，原型指向指定对象的 prototype，继承内置对象 Object
- `Object.create(arg)`创建的对象的原型取决于 arg，arg 为 null，新对象是空对象，没有原型，不继承任何对象；arg 为指定对象，新对象的原型指向指定对象，继承指定对象

# 相关文档

[相关文档](https://github.com/mqyqingfeng/Blog/issues/13)
