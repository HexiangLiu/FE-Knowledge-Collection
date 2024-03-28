# 规范类型 Reference

- base value (属性所在对象)
- referenced name（属性名称）
- strict reference

```js
var foo = 1;

// 对应的Reference是：
var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false,
};
```

# 如何确定 this 的值

1. 计算 MemberExpression 的结果赋值给 ref
2. 判断 ref 类型
   1. 如果 ref 是 reference 类型，并且 `IsPropertyReference(ref)` 是 true(ref 是对象), this 为`GetBase(ref)`，即 `base value` (属性所在对象)
   2. 如果 ref 是 reference 类型，但`base value`为 Environment Record，this 为 undefined
   3. 如果 ref 不是 reference 类型，this 为 undefined

## MemberExpression 其实就是()左边的部分

```js
function foo() {
  console.log(this);
}

foo(); // MemberExpression 是 foo

function foo() {
  return function () {
    console.log(this);
  };
}

foo()(); // MemberExpression 是 foo()

var foo = {
  bar: function () {
    return this;
  },
};

foo.bar(); // MemberExpression 是 foo.bar
```

## 判断 ref 是不是一个 Reference 类型

关键在于判断 MemberExpression 返回的结果是不是一个 Reference 类型

# 测试

```js
var value = 1;

var foo = {
  value: 2,
  bar: function () {
    return this.value;
  },
};

//示例1
console.log(foo.bar()); // 2
//示例2
console.log(foo.bar()); // 2
//示例3
console.log((foo.bar = foo.bar)()); // 1
//示例4
console.log((false || foo.bar)()); // 1
//示例5
console.log((foo.bar, foo.bar)()); // 1
```

# 相关文档

[相关文档](https://github.com/mqyqingfeng/Blog/issues/7)
