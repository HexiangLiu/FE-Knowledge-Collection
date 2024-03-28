# 什么是 ajax

异步 javascript 与 XML（异步交互）, 可以帮助我们在不重载页面的情况下，向服务端发送请求更新页面，实现异步交互

1. 创建`XMLHttpRequest`对象
2. 使用对象的`open()`方法与服务端建立连接
3. 使用对象的`send()`方法发送数据
4. 通过对象提供的`onreadystatechange`事件监听服务端通信状态
5. 接收应的数据结果
6. 更新页面

```js
var xhr = new XMLHttpRequest(),
  method = 'GET',
  url = 'https://developer.mozilla.org/';

xhr.open(method, url, true);
xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
    console.log(xhr.responseText);
  }
};
xhr.send();
```
