# 什么是 Treeshaking

清除没被使用的模块

# 依赖 ES6 模块特性

ES6 模块依赖关系是确定的，和运行时状态无关，可进行可靠的静态分析(tree-shaking 的基础)
require 可以动态引入，只有运行的时候才知道引入什么模块

- 只能作为模块顶层的语句出现
- import 的模块名只能为字符串常量
- 依赖关系是不可变的，import binding is immutable
