# Event Bridge 事件总线

Event Bridge 提供了两个主要工具，用于增强React应用中组件间的通信和状态管理：

1. `UIBridge` - 用于UI组件间事件链式调用
2. `EventBridge` - 用于组件上下文管理

## UIBridge

UIBridge 是一个轻量级的事件总线，专为UI组件间的链式事件通信而设计。它解决了以下问题：

- 在没有直接引用关系的组件间传递事件
- 实现链式事件处理流程
- 在事件间传递状态数据

### 工作原理

UIBridge 基于事件链的概念工作：

1. 你可以定义一系列需要按顺序执行的事件
2. 每个事件可以注册一个处理函数
3. 事件处理函数可以向下一个事件传递数据
4. 事件链按添加顺序依次执行

### 基本用法

```typescript
import { ui } from 'lib/event-bridge/instance';

// 注册事件监听器
ui.on("table.switch_tabs.holders", (props, next) => {
  console.log("Tab switched to holders");
  // 调用next()继续执行链中的下一个事件
  next();
});

ui.on("table.holders.select", (props, next) => {
  const { holders } = props;
  console.log("Holders selected:", holders);
  // 调用next()并传递参数给下一个事件
  next({ holders });
});

ui.on("k.holders.show", (props, next) => {
  // 可以通过prev属性访问上一个事件传递的数据
  const { prev } = props;
  const { holders } = prev;
  console.log("Showing holders:", holders);
  // 如果是最后一个事件，调用next()不会执行任何操作
  next();
});

// 触发事件链
ui.add("table.switch_tabs.holders")
  .add("table.holders.select", { holders: ["123", "456"] })
  .add("k.holders.show");
```

### 在React组件中使用

```tsx
import { useEffect } from 'react';
import { ui } from 'lib/event-bridge/instance';

function HolderTable() {
  useEffect(() => {
    // 注册事件监听器
    const unsubscribe = ui.on("table.holders.select", (props, next) => {
      const { holders } = props;
      // 处理选择事件
      setSelectedHolders(holders);
      // 继续事件链
      next({ holders });
    });
    
    // 组件卸载时取消监听
    return unsubscribe;
  }, []);
  
  const handleSelect = (holders) => {
    // 触发事件链
    ui.add("table.holders.select", { holders })
      .add("k.holders.show");
  };
  
  return (
    // ...组件UI
  );
}
```

### API参考

#### `on(event: string, callback: UIEventHandler): () => void`

注册事件监听器。

- `event` - 要监听的事件名称
- `callback` - 当事件被触发时执行的回调函数
  - `props` - 事件参数，包含传递给事件的数据和上一个事件的输出(`prev`)
  - `next` - 函数，调用它以执行链中的下一个事件，可以传递参数给下一个事件

返回一个取消监听的函数。

#### `add(event: string, props?: Record<string, any>): UIBridge`

将事件添加到调用链。

- `event` - 事件名称
- `props` - 事件参数（可选）

返回UIBridge实例，支持链式调用。

#### `clear(): UIBridge`

清空事件链。

返回UIBridge实例，支持链式调用。

### 事件链执行流程详解

1. 当调用`add()`方法添加第一个事件时，事件链开始执行
2. 每个事件执行器都会接收到：
   - 当前事件的参数（直接作为props的字段）
   - 上一个事件传递的参数（在`prev`属性中）
   - `next`函数，用于继续执行链
3. 调用`next(nextProps)`时可以传递参数给下一个事件
4. 如果事件没有注册监听器，会自动跳到下一个事件，并将当前事件的参数作为prev传递
5. 当最后一个事件执行完毕后，事件链清空
6. 如果是最后一个事件，调用`next()`不会执行任何操作

### 最佳实践

1. **事件命名约定**：使用点分隔的命名空间，如`component.action.subject`
2. **组件卸载时取消监听**：在React组件中使用时，确保在组件卸载时取消事件监听
3. **传递关键数据**：通过next()只传递下一个事件需要的数据，避免传递过多无关数据
4. **避免循环依赖**：不要创建可能导致无限循环的事件链

## EventBridge

EventBridge 是一个用于管理组件上下文数据的工具。它允许组件注册自己的上下文，并在上下文变更时通知其他组件。

### 基本用法

```typescript
import { bus } from 'lib/event-bridge/instance';

// 添加上下文
const contextId = bus.addContext({
  from: "tableComponent",
  data: { rows: [1, 2, 3] }
});

// 监听上下文变更
const unsubscribe = bus.onContextChange((context, from, end) => {
  console.log("Context changed:", from);
  console.log("New context:", context);
});

// 更新上下文
bus.updateContext({
  id: contextId,
  from: "tableComponent",
  data: { rows: [1, 2, 3, 4] }
});

// 删除上下文
bus.removeContext(contextId);

// 取消监听
unsubscribe();
```

### API参考

#### `addContext(context: Omit<ContextItem, "id"> & { id?: string }, keepAlive = true): string`

添加新的上下文。

- `context` - 上下文对象（必须包含`from`字段）
- `keepAlive` - 是否保持上下文存活（如果为`false`，上下文将在触发一次后被自动删除）

返回上下文ID。

#### `removeContext(context_id: string): void`

通过ID删除上下文。

#### `updateContext(context: ContextItem, keepAlive = true): string | undefined`

更新现有上下文。

- `context` - 更新后的上下文对象（必须包含`id`和`from`字段）
- `keepAlive` - 是否保持上下文存活

返回上下文ID或undefined（如果上下文不存在）。

#### `onContextChange(callback: (context: WrapContext, from: string, end?: () => void) => void): () => void`

监听上下文变更。

- `callback` - 当上下文变更时执行的回调函数
  - `context` - 所有上下文数据
  - `from` - 变更来源
  - `end` - 可选的回调函数，执行它会删除临时上下文

返回一个取消监听的函数。

## UIBridge 和 EventBridge 结合使用

UIBridge 和 EventBridge 可以结合使用，创建更强大的组件通信模式：

```typescript
import { ui, bus } from 'lib/event-bridge/instance';

// 在事件处理中添加上下文
ui.on("table.holders.select", (props, next) => {
  const { holders } = props;
  
  // 添加上下文
  const contextId = bus.addContext({
    from: "holderTable",
    holders
  });
  
  // 继续事件链
  next({ holders, contextId });
});

// 监听上下文变更
bus.onContextChange((context, from) => {
  if (from === "holderTable") {
    // 根据上下文变更更新UI
    const holderContext = context.holderTable;
    // ...
  }
});
``` 