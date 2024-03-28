# GET 与 POST 的区别

- 数据操作类型不同
  - GET 查询, POST 增删改
- 安全性不同
  - GET 请求通过 URL 传参，会暴露(xss 攻击)，POST 请求通过 Request Body 传参
- 参数大小不同
  - URL 长度有限制, POST 无限制
- 浏览器回退表现不同
  - GET 不会再次请求
