# Error Boundaries (异常边界)

Error Boundaries 为 React 组件，用于捕获组件树中所有组件产生的 js 异常，并渲染兜底的 UI 来替代问题组件

可以捕获子组件生命周期函数中的异常及构造函数和 render 函数

不能捕获以下异常：

- Event handlers（事件处理函数）
- Asynchronous code（异步代码，如 setTimeout、promise 等）
- Server side rendering（服务端渲染）
- Errors thrown in the error boundary itself (rather than its children)（异常边界组件本身抛出的异常）

## 示例代码

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## React 异常处理的入口

1. reconciliation 阶段的 renderRoot 函数，对应的异常处理为 throwException
2. commit 阶段的 commitRoot 函数，对应的异常处理为 dispatch

## 异常处理流程

实际上都是通过 try...catch...进行异常处理

1. 遍历当前异常节点的父节点，找到对应错误信息（错误名称、调用栈）
2. 遍历到 ErrorBoundary 组件时，创建新的 update，并放入更新队列中
3. update 里会调用 componentDidCatch 函数
4. commit 阶段调用 update
