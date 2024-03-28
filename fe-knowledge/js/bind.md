# bind 的实现

```js
Function.prototype.bind2 = function (context) {
  const self = this;
  const args = Array.slice.call(arguments, 1);
  return function () {
    const _args = Array.slice.call(arguments);
    return self.apply(target, _args.concat(args));
  };
};
```

[相关文档](https://github.com/mqyqingfeng/Blog/issues/12)
