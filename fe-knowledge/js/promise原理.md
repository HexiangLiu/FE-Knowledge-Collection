# 实现一个 Promise

**Promise 解决什么问题**

- 回调地狱(多个 setTimeout 嵌套以保持执行顺序)
- 支持多个并发请求

```js
function Promise(fn) {
  let state = 'pending';
  const onFullFilledCallbacks = [];
  const onRejectCallbacks = [];
  let value;
  function resolve(v) {
    if (state === 'pending') {
      state = 'fullfilled';
      value = v;
      while (onFullFilledCallbacks.length) {
        onFullFilledCallbacks.shift()(v);
      }
    }
  }
  function reject(v) {
    if (state === 'pending') {
      state = 'rejected';
      value = v;
      while (onRejectCallbacks.length) {
        onRejectCallbacks.shift()(v);
      }
    }
  }
  this.then = function (onFullFilled, onRejected) {
    return new Promise((resolve, reject) => {
      if (state === 'pending') {
        onFullFilledCallbacks.push(() => {
          const ret = onFullFilled(value);
          if (ret instanceof Promise) {
            ret.then(resolve, reject);
          } else {
            resolve(ret);
          }
        });
        onRejectCallbacks.push(() => {
          const ret = onRejected(value);
          if (ret instanceof Promise) {
            ret.then(resolve, reject);
          } else {
            reject(ret);
          }
        });
      }
      if (state === 'fullfilled') {
        const ret = onFullFilled(value);
        resolve(ret);
      }
      if (state === 'rejected') {
        onRejected(value);
      }
    });
  };
  fn(reolve, reject);
}
```

# 实现一个 Promsie.all

```js
Promise.all = function (promises) {
  const result = [];
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i];
      Promise.resolve(promise).then(
        (v) => {
          result.push(v);
          result.length === promises.length && resolve(result);
        },
        (v) => {
          reject(v);
        }
      );
    }
  });
};
```

# 实现一个 Promsie.race

```js
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((promise) => {
      Promise.resolve(promise).then((v) => resolve(v), reject);
    });
  });
};
```

# 实现一个 Promsie.any

```js
Promise.any = function (promises) {
  let rejectsCount = 0;
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then(
        (v) => {
          resolve(v);
        },
        (e) => {
          rejectsCount++;
          rejectsCount === promises.length &&
            reject(new AggregateError('All promises were rejected'));
        }
      );
    }
  });
};
```

# 相关文档

[相关文档](https://juejin.cn/post/7103787996654600206)
