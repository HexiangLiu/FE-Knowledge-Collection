# fiber 特性

react16 引入，将长时间的更新任务分片，可中途暂停，将线程让给更高优的任务(用户输入)

## 怎么拆分

- 新的任务调度，有高优先级任务时让出线程
- 新的数据结构，可随时中断，下次可接着执行

### requestIdleCallback

### fiber 可中断的数据结构

类似链表，有三个指针

- child: 指向第一个子元素
- sibling: 指向下一个兄弟元素
- return: 指向父元素

在浏览器空闲时计算 diff(调和)和渲染

## 流程描述

### render 阶段 (可中断)

1. requestIdleCallback(workLoop)
2. nextUnitWork
   - 记录当前处理的 fiber 节点, nextUnitWork 为 null 后进入 commit 阶段
3. 深度优先遍历
4. performUnitOfWork
   - 向下递归 child => sibling
5. beginWork
   - 构建 fiber 节点，调和 diff
6. completeUnitOfWork
   - 向上递归，sibling => return
7. completeWork
   - 构建真实 dom

### commit 阶段 (不可中断)

根据 render 阶段生成的 workInProgressTree(effect list)开始更新 DOM 并调用生命周期方法

1. 在标记了 Snapshot effect 的节点上使用 getSnapshotBeforeUpdate 生命周期方法
2. 在标记了 Deletion effect 的节点上调用 componentWillUnmount 生命周期方法
3. 执行所有 DOM 插入，更新和删除
4. 将 workInProgressTree 树设置为 current 树
5. 在标记了 Placement effect 的节点上调用 componentDidMount 生命周期方法
6. 在标记了 Update effect 的节点上调用 componentDidUpdate 生命周期方法

## 函数组件

- 函数组件的 fiber type 为函数，执行后可获得 DOM 元素 `const children = [fiber.type(fiber.props)];`
- 函数组件 fiber 节点没有 dom 属性

## hooks

hooks 作为链表保存在 fiber 的 memoizedState 上，每次调用必须保持顺序一致，否则 react 会报错(状态不匹配)

### 为什么在 16.8 引入 hook

- 组件中的业务逻辑难以拆分与复用
- 相对于 HOC，不会产生层爆炸的问题

### useState

不可在条件语句中使用，fiber 上维护了 hooks 链表，需保证调用顺序

### setState

#### 为什么多次 setState 只调用了一次

会被 enqueueUpdate，多次 update 会作为链表维护在 hook 的 update queue 上，在下一次 render 时循环调用计算新的 state

#### 同步与异步

React18 前: 在 setTimeout 或者原生 dom 事件中，setState 是同步(这里的同步指同步更新 fiber 上的 state，非同步渲染)
React18 后: 都是异步批处理

### useEffect

执行时机在 commit phase

### hook 模拟实现

#### 1. 实现一个 useState

```js
function useState(initialState) {
  if (firstPaint) {
    const hook = {
      next: null,
      state: initialState,
      queue: null,
    };
    if (!wipHook) {
      wipHook = hook;
    }
    wipHook = wipHook.next = hook;
  } else {
    const { queue } = wipHook;
    let update = queue.firstUpdate;
    do {
      // 更新state
      update = update.next;
    } while (update !== null && update !== queue.firstUpdate);
  }

  function setState(update) {
    if (!fiber.queue) {
      fiber.queue = {
        firstUpdate: update,
        lastUpdate: update,
      };
    } else {
      const { lastUpdate } = fiber.queue;
      lastUpdate = lastUpdate.next = update;
    }
    // 调度更新
  }
  wipHook = wipHook.next;

  return [hook.state, setState];
}
```

#### 2. 实现一个 useEffect

```js
function useEffect(callback, deps) {
  const oldDeps = wipHook.deps;
  const hasChanged = deps ? deps.some((dep, i) => dep !== oldDeps[i]) : true;
  if (hasChanged) {
    callback();
    wipHook.deps = deps;
  }
  wipHook = wipHook.next;
}
```

#### 3. 实现一个 useCallback

```js
function useCallback(callback, deps) {
  const oldDeps = wipHook.deps;
  const oldCallback = wipHook.callback;
  const hasChanged = deps ? deps.some((dep, i) => dep !== oldDeps[i]) : true;
  if (hasChanged) {
    wipHook.callback = callback;
    wipHook.deps = deps;
    return callback;
  }
  wipHook = wipHook.next;
  return oldCallback;
}
```

#### 4. 实现一个 useMemo

```js
function useMemo(callback, deps) {
  const oldDeps = wipHook.deps;
  const oldValue = wipHook.value;
  const hasChanged = deps ? deps.some((dep, i) => dep !== oldDeps[i]) : true;
  if (hasChanged) {
    const newValue = callback();
    wipHook.deps = deps;
    wipHook.value = newValue;
    return newValue;
  }
  wipHook = wipHook.next;
  return oldValue;
}
```

#### 5. 实现一个 useRef

```js
function useRef(initialValue) {
  if (!wipHook.ref) {
    wipHook.ref = { current: initialValue };
  }
  return wipHook.ref;
}
```

## 相关文档

[深入 react 源码中的 setState](https://cloud.tencent.com/developer/article/2193660)
[React Hooks 原理剖析](https://zhuanlan.zhihu.com/p/372790745)
[React Fiber 架构 —— “更新”到底是个啥](https://zhuanlan.zhihu.com/p/546865854?utm_id=0)

## 全流程实现代码

```js
function createTextVDom(text) {
  return {
    type: 'TEXT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  // 核心逻辑不复杂，将参数都塞到一个对象上返回就行
  // children也要放到props里面去，这样我们在组件里面就能通过this.props.children拿到子元素
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'object' ? child : createTextVDom(child);
      }),
    },
  };
}

// 创建DOM的操作
function createDom(vDom) {
  let dom;
  // 检查当前节点是文本还是对象
  if (vDom.type === 'TEXT') {
    dom = document.createTextNode(vDom.props.nodeValue);
  } else {
    dom = document.createElement(vDom.type);

    // 将vDom上除了children外的属性都挂载到真正的DOM上去
    if (vDom.props) {
      Object.keys(vDom.props)
        .filter((key) => key !== 'children')
        .forEach((item) => {
          if (item.indexOf('on') === 0) {
            dom.addEventListener(
              item.substr(2).toLowerCase(),
              vDom.props[item],
              false
            );
          } else {
            dom[item] = vDom.props[item];
          }
        });
    }
  }

  return dom;
}

// 更新DOM的操作
function updateDom(dom, prevProps, nextProps) {
  // 1. 过滤children属性
  // 2. 老的存在，新的没了，取消
  // 3. 新的存在，老的没有，新增
  Object.keys(prevProps)
    .filter((name) => name !== 'children')
    .filter((name) => !(name in nextProps))
    .forEach((name) => {
      if (name.indexOf('on') === 0) {
        dom.removeEventListener(
          name.substr(2).toLowerCase(),
          prevProps[name],
          false
        );
      } else {
        dom[name] = '';
      }
    });

  Object.keys(nextProps)
    .filter((name) => name !== 'children')
    .forEach((name) => {
      if (name.indexOf('on') === 0) {
        dom.addEventListener(
          name.substr(2).toLowerCase(),
          nextProps[name],
          false
        );
      } else {
        dom[name] = nextProps[name];
      }
    });
}

// 统一操作DOM
function commitRoot() {
  deletions.forEach(commitRootImpl); // 执行真正的节点删除
  commitRootImpl(workInProgressRoot.child); // 开启递归
  currentRoot = workInProgressRoot; // 记录一下currentRoot
  workInProgressRoot = null; // 操作完后将workInProgressRoot重置
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    // dom存在，是普通节点
    domParent.removeChild(fiber.dom);
  } else {
    // dom不存在，是函数组件,向下递归查找真实DOM
    commitDeletion(fiber.child, domParent);
  }
}

function commitRootImpl(fiber) {
  if (!fiber) {
    return;
  }

  // const parentDom = fiber.return.dom;
  // 向上查找真正的DOM
  let parentFiber = fiber.return;
  while (!parentFiber.dom) {
    parentFiber = parentFiber.return;
  }
  const parentDom = parentFiber.dom;

  if (fiber.effectTag === 'REPLACEMENT' && fiber.dom) {
    parentDom.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    // parentDom.removeChild(fiber.dom);
    commitDeletion(fiber, parentDom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    // 更新DOM属性
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  // 递归操作子元素和兄弟元素
  commitRootImpl(fiber.child);
  commitRootImpl(fiber.sibling);
}

// 任务调度
let nextUnitOfWork = null;
let workInProgressRoot = null;
let currentRoot = null;
let deletions = null;
// workLoop用来调度任务
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    // 这个while循环会在任务执行完或者时间到了的时候结束
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // 任务做完后统一渲染
  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }

  // 如果任务还没完，但是时间到了，我们需要继续注册requestIdleCallback
  requestIdleCallback(workLoop);
}

function buildNewFiber(fiber, workInProgressFiber) {
  return {
    type: fiber.type,
    props: fiber.props,
    dom: null, // 构建fiber时没有dom，下次perform这个节点是才创建dom
    return: workInProgressFiber,
    alternate: null, // 新增的没有老状态
    effectTag: 'REPLACEMENT', // 添加一个操作标记
  };
}

function reconcileChildren(workInProgressFiber, elements) {
  // 构建fiber结构
  let oldFiber =
    workInProgressFiber.alternate && workInProgressFiber.alternate.child; // 获取上次的fiber树
  let prevSibling = null;
  let index = 0;
  if (elements && elements.length) {
    // 第一次没有oldFiber，那全部是REPLACEMENT
    if (!oldFiber) {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const newFiber = buildNewFiber(element, workInProgressFiber);

        // 父级的child指向第一个子元素
        if (i === 0) {
          workInProgressFiber.child = newFiber;
        } else {
          // 每个子元素拥有指向下一个子元素的指针
          prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
      }
    }

    while (index < elements.length && oldFiber) {
      let element = elements[index];
      let newFiber = null;

      // 对比oldFiber和当前element
      const sameType = oldFiber && element && oldFiber.type === element.type; //检测类型是不是一样
      // 先比较元素类型
      if (sameType) {
        // 如果类型一样，复用节点，更新props
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          return: workInProgressFiber,
          alternate: oldFiber, // 记录下上次状态
          effectTag: 'UPDATE', // 添加一个操作标记
        };
      } else if (!sameType && element) {
        // 如果类型不一样，有新的节点，创建新节点替换老节点
        newFiber = buildNewFiber(element, workInProgressFiber);
      } else if (!sameType && oldFiber) {
        // 如果类型不一样，没有新节点，有老节点，删除老节点
        oldFiber.effectTag = 'DELETION'; // 添加删除标记
        deletions.push(oldFiber); // 一个数组收集所有需要删除的节点
      }

      oldFiber = oldFiber.sibling; // 循环处理兄弟元素

      // 父级的child指向第一个子元素
      if (index === 0) {
        workInProgressFiber.child = newFiber;
      } else {
        // 每个子元素拥有指向下一个子元素的指针
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;
    }
  }
}

// 申明两个全局变量，用来处理useState
// wipFiber是当前的函数组件fiber节点
// hookIndex是当前函数组件内部useState状态计数
let wipFiber = null;
let hookIndex = null;
function useState(init) {
  // 取出上次的Hook
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  // hook数据结构
  const hook = {
    state: oldHook ? oldHook.state : init, // state是每个具体的值
  };

  // 将所有useState调用按照顺序存到fiber节点上
  wipFiber.hooks.push(hook);
  hookIndex++;

  // 修改state的方法
  const setState = (value) => {
    hook.state = value;

    // 只要修改了state，我们就需要重新处理这个节点
    workInProgressRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };

    // 修改nextUnitOfWork指向workInProgressRoot，这样下次requestIdleCallback就会处理这个节点了
    nextUnitOfWork = workInProgressRoot;
    deletions = [];
  };

  return [hook.state, setState];
}

function updateFunctionComponent(fiber) {
  // 支持useState，初始化变量
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = []; // hooks用来存储具体的state序列

  // 函数组件的type就是个函数，直接拿来执行可以获得DOM元素
  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}

// updateHostComponent就是之前的操作，只是单独抽取了一个方法
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber); // 创建一个DOM挂载上去
  }

  // 将我们前面的vDom结构转换为fiber结构
  const elements = fiber.props && fiber.props.children;

  // 调和子元素
  reconcileChildren(fiber, elements);
}

// performUnitOfWork用来执行任务，参数是我们的当前fiber任务，返回值是下一个任务
function performUnitOfWork(fiber) {
  // 检测函数组件
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 这个函数的返回值是下一个任务，这其实是一个深度优先遍历
  // 先找子元素，没有子元素了就找兄弟元素
  // 兄弟元素也没有了就返回父元素
  // 然后再找这个父元素的兄弟元素
  // 最后到根节点结束
  // 这个遍历的顺序其实就是从上到下，从左到右
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.return;
  }
}
// 使用requestIdleCallback开启workLoop
requestIdleCallback(workLoop);

function render(vDom, container) {
  workInProgressRoot = {
    dom: container,
    props: {
      children: [vDom],
    },
    alternate: currentRoot,
  };

  deletions = [];

  nextUnitOfWork = workInProgressRoot;
}

class Component {
  constructor(props) {
    this.props = props;
  }
}

function transfer(Component) {
  return function (props) {
    const component = new Component(props);
    let [state, setState] = useState(component.state);
    component.props = props;
    component.state = state;
    component.setState = setState;

    return component.render();
  };
}

export default {
  createElement,
  render,
  useState,
  Component,
  transfer,
};
```
