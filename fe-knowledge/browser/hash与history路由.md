# hash 路由

- hash 值不会随请求发送到服务端，所以改变 hash 不会重新加载页面
- 通过 location.hash 设置 hash 值，通过监听 window 的 hashchange 事件

# history 路由

- 浏览器 history 对象
  - go
  - forward
  - back
  - pushState、replaceState，接受三个参数：
  - object：可将对象内容传递到新页面
  - title：标题(兼容性差)
  - url：新的网址，跨域会报错
- 监听 popstate 事件
  - pushState、replaceState 不会触发
  - 首次加载不会触发
  - 使用 go, forward, back 方法时触发
