```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: {
          loader: 'css-loader',
          options: {
            modules: {
              // 自定义 hash 名称
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
            },
          },
        },
      },
    ],
  },
};
```

- css-loader 的作用主要是解析 css 文件中的@import 和 url 语句，处理 css-modules，并将结果作为一个 js 模块返回
- 模块化引入，避免全局样式冲突

# PostCSS(css 的 babel，通过 ast 分析 css 代码再处理)

场景：

- 配合 stylelint 校验 css 语法
