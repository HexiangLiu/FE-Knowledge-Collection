# JS 的 8 种数据类型

- number
- string
- boolean
- object
- null
  - 变量被人为设置为空对象（非原始状态），释放对象时可使用
- undefined
  - 变量未进行赋值时的默认值，不要显示赋值 undefined
- symbol
  - 每个从 Symbol() 返回的 symbol 值都是唯一的（不可使用 new 操作符）。一个 symbol 值能作为对象属性的标识符（仅有目的）
- bigInt
  - 用于表示大于 2^53 - 1（原为 JS 可表达的最大数字）的整数
  - 在整数后加 n 的方式进行定义，如 10n，或者直接调用 BigInt()（无需 new）

# 数据存储位置

- 基本类型保存在栈中
- 引用类型，栈中只保存引用地址，数据保存在堆内存中
