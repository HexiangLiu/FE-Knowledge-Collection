# Virtual DOM

- 使用 Javascript 对象对 DOM 树的描述
- 提高渲染性能，进行局部渲染，避免重新渲染整个页面
- 重新渲染时生成新的 JS 对象，与旧的虚拟 DOM 对比后一次渲染，避免了频繁的 dom 操作
