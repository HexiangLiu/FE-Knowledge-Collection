# v8 内存限制

64 位 1.4GB，32 位 0.7GB

# 为什么会有内存限制

- 浏览器单线程
- 内存回收有耗时

# v8 内存分代

- 新生代 new_space
  - 64 位 32MB、32 位 16MB
  - Scavenge 算法(空间换时间，from、to, 复制活动对象)
  - 晋升 old_space 条件：经历过一次 Scavenge 算法、To 空间内存占比超过 25%
- 老生代 old_space
  - Mark-sweep(标记清除)，从根节点(如 window, 或某函数上下文)出发回收不可访问的变量，解决引用计数存在的循环引用问题
  - Mark-compact(标记整理)，解决内存地址不连续问题
- 大对象 large_object_space
  - 不会被垃圾回收
- 代码区 code_space

# 避免内存溢出

- 少用全局变量
- 注意闭包影响
- 手动清除定时器
- 手动清除事件监听器
- 弱引用 WeakMap、WeakSet(其 key 值必须为对象，引用为弱引用)
- 避免在浏览器处理大文件(分片上传)

# 如何发现内存泄漏

[如何发现内存泄漏](https://segmentfault.com/a/1190000020231307#item-6)

# 相关文档

[相关文档](https://github.com/mqyqingfeng/Blog/issues/42)
