# http 1.0

客户端与服务端短暂连接，浏览器每次请求都需要与服务端建立 TCP 连接，请求完成后连接会自动断开

# http 1.1

引入了 keep-alive 机制保持长链接（TCP 连接默认不关闭，一个连接可以发送多个请求）和 TLS 来保持通信安全，但并发性不足（允许复用一个连接，但请求串行）

- 线头阻塞: TCP 连接上的请求都为串行，前面的请求会阻塞后面的
- 传输效率的，传输格式为文本: HTTP/1.X 版本是采用文本格式，
- 首部未压缩，而且每一个请求都会带上 cookie、user-agent 等完全相同的首部
- 客户端需主动请求

# http 2.0

对 http1.1 协议的升级，性能上得到大幅提升

## 二进制分帧

http 2.0 性能提升的核心， 1.1 响应为文本格式，2.0 将请求分为 header 帧与 data 帧，采用二进制编码，解析更高效，体积更小

## 多路复用

HTTP2 建立一个 TCP 连接，可以并发多个请求

- 一个连接上面可以有任意多个流（stream），消息（一个完整的请求）被分割成了一个或多个帧在流里面传输，帧包含了流标识，传输过去后再进行重组，因此所有的请求都不会互相阻塞，

## 头部压缩

http 1.1 中，首部采用文本格式传输，传输效率低， HTTP2 为此采用 HPACK 压缩格式来压缩首部

头部压缩需要在浏览器和服务器端之间：

- 通过静态 Huffman 编码对传输的首部字段（字典中没有的字段）进行编码，减小体积
- 维护一份静态字典，包含常见的头部名称，以及常见的头部名称和值的组合
- 维护一份动态字典，可以动态的添加内容
  - 因此在交互时只需要传一个索引值(1 字节)

## 服务端推送

服务端预测客户端所需资源，主动推送至客户端
实现原理即服务器可以分析这个页面所依赖的其他资源，主动推送到客户端的缓存，当客户端收到原始网页的请求时，它需要的资源已经位于缓存

- eg: 客户端请求 index.html，服务器端能够额外推送 script.js 和 style.css

# http 3.0

替换 TCP 协议为 UDP 协议

- 避免了 TCP 建立链接的耗时，延迟更低
- 避免 TCP 线头阻塞