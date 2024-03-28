[相关文档](https://juejin.cn/post/6847902222756347911)

# 何为 React-redux

Redux 只是状态机，通过 React-Redux 将 Redux 与 React 的 UI 绑定在一起，dispatch action 时会自动更新网页

# 手写 Provider

provider 使用了 context api

```jsx
import React from 'react';

const ReactReduxContext = React.createContext();

function Provider(props) {
  const { children, store } = props;
  const contextValue = { store };
  return (
    <ReactReduxContext.Provider value={contextValue}>
      {children}
    </ReactReduxContext.Provider>
  );
}
```

# 手写 connect

- 返回 HOC 高阶组件
- 接收两个参数 mapStateToProps, mapDispatchToProps

## 基本功能

```js
function childPropsSelector(store, wrapperProps) {
  const stateProps = mapStateToProps(store.getState());
  const dispatchProps = mapDispatchToProps(store.dispatch);
  const newProps = Object.assign({}, props, stateProps, dispatchProps);
  return newProps;
}
function connect(mapStateToProps, mapDispatchToProps) {
  return function connectHOC(WrappedComponent) {
    return function Wrapper(props) {
      const { store } = useContext(ReactReduxContext);
      const stateProps = mapStateToProps(store.getState());
      const dispatchProps = mapDispatchToProps(store.dispatch);
      const newProps = Object.assign({}, props, stateProps, dispatchProps);
      return <WrappedComponent {...newProps}></WrappedComponent>;
    };
  };
}
```

## 触发更新

- store.subscribe，检查参数变化
- useReducer 强制更新

```js
function updateReducer(count) {
  return count + 1;
}

function connect(mapStateToProps, mapDispatchToProps) {
  return function connectHOC(WrappedComponent) {
    return function Wrapper(props) {
      const { store } = useContext(ReactReduxContext);
      const lastProps = useRef();
      const [_, forceUpdate] = useReducer(updateCountReducer, 0);
      const stateProps = mapStateToProps(store.getState());
      const dispatchProps = mapDispatchToProps(store.dispatch);
      const mergedProps = Object.assign({}, props, stateProps, dispatchProps);
      store.subscribe(() => {
        const stateProps = mapStateToProps(store.getState());
        const dispatchProps = mapDispatchToProps(store.dispatch);
        const newProps = Object.assign({}, props, stateProps, dispatchProps);
        if (newProps !== lastProps.current) {
          forceUpdate();
          lastProps.current = newProps;
        }
      });
      return <WrappedComponent {...mergedProps} />;
    };
  };
}
```
