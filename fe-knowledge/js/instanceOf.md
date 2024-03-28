# 何为 instanceOf

判断目标对象的 prototype 是否出现在对象的原型链上

```js
function mock_instance_of(left, right) {
  let proto = left.__proto__;
  while (proto) {
    if (proto === right.prototype) {
      return true;
    }
    proto = proto.__proto__;
  }
  return false;
}
```

# instanceOf 与 typeof 的区别

1. typeof 无法区分 Object, Array, null，都返回 object
2. instanceOf 无法判断基本数据类型 Number, String, Boolean

# 如何精准判断类型

`Object.prototype.toString.call()`

[相关文档](https://juejin.cn/post/6844903613584654344)
