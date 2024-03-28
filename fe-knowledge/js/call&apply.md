# call 与 apply 的异同

**相同点**

- 调用者必须为函数
- 第一个参数为对象，改变 this 指向

**不同点**

- call 从第二个参数开始可以接受任意数量的参数，并映射到相应的 Function 参数上
- apply 第二个参数为数组或类数组(可通过角标调用，具有 length 属性)

[相关文档](https://segmentfault.com/a/1190000018017796)
