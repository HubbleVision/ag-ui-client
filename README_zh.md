# AG-UI-Client

<div align="center">
  <img src="https://placehold.co/600x300?text=UIBridge+Agent+Orchestration" alt="AG-UI-Client Logo">
  <p>
    <em>使 AI 代理能够通过可序列化的事件链编排复杂的 UI 交互</em>
  </p>
  <p>
    <a href="#功能特点">功能特点</a> •
    <a href="#开始使用">开始使用</a> •
    <a href="#工作原理">工作原理</a> •
    <a href="#api-参考">API 参考</a> •
    <a href="#应用场景">应用场景</a>
  </p>
  <p>
    <a href="README.md">English Documentation</a>
  </p>
</div>

## 概述

AG-UI-Client 展示了一种强大的新范式，让 AI 代理能够编排复杂的 UI 交互。

### 问题背景

当前 AI 代理与用户界面的集成面临着显著的限制：

- AI 系统只能提供基于文本的输出或渲染简单的模板
- UI 编排需要严格的、预定义的交互路径
- UI 组件之间的状态管理难以协调
- 操作的时序和顺序无法精确控制

### 解决方案：UIBridge

UIBridge 提供了一个可序列化的事件链架构，使 AI 代理能够创建、调度和执行复杂的 UI 交互：

```javascript
// AI 代理基于用户需求生成这样的事件序列
const events = [
  { event: "data.analyze", props: { source: "quarterly_report.csv" } },
  { event: "sleep", props: { duration: 500 } },
  { event: "chart.generate", props: { type: "bar", title: "收入明细" } },
  { event: "sleep", props: { duration: 300 } },
  {
    event: "recommendations.display",
    props: { insights: ["专注于 SaaS 增长", "降低硬件成本"] },
  },
];

// 执行 AI 生成的计划
ui.batch(events);
```

## 功能特点

- **🔄 可序列化事件链**：AI 代理可以创建、序列化和传输完整的 UI 工作流
- **⏱️ 精确时序控制**：精确控制 UI 操作的时序和顺序
- **🔄 状态管理**：在工作流步骤之间传递数据
- **🧩 组件无关**：适用于任何组件框架（React、Vue 等）
- **📡 网络友好**：JSON 可序列化格式，适合远程执行
- **↔️ 双向通信**：UI 组件可以将数据发送回 AI 代理
- **🔌 双重 API**：同时支持链式 API（`ui.add().add()`）和批量 API（`ui.batch([])`）

## 开始使用

### 安装

```bash
# 克隆仓库
git clone https://github.com/liunian-hub/ag-ui-client.git

# 安装依赖
cd ag-ui-client
npm install

# 运行开发服务器
npm run dev
```

### 基本用法

1. 为 UI 组件定义事件处理器：

```jsx
// 注册事件监听器
ui.on("chart.create", (props, next) => {
  const { type, data, title } = props;
  createChart(type, data, title);
  next({ chartId: generatedChartId });
});

ui.on("recommendations.display", (props, next) => {
  const { insights, prev } = props;
  const { chartId } = prev; // 获取上一步的数据
  displayRecommendations(chartId, insights);
  next();
});
```

2. 让 AI 生成并执行事件链：

```javascript
// 链式 API
ui.add("chart.create", { type: "bar", data: salesData, title: "第三季度销售" })
  .sleep(500)
  .add("recommendations.display", { insights: aiGeneratedInsights });

// 或批量 API（可序列化）
ui.batch([
  {
    event: "chart.create",
    props: { type: "bar", data: salesData, title: "第三季度销售" },
  },
  { event: "sleep", props: { duration: 500 } },
  {
    event: "recommendations.display",
    props: { insights: aiGeneratedInsights },
  },
]);
```

## 工作原理

1. **事件定义**：定义 UI 事件，组件可以监听并作出反应
2. **链式创建**：AI 代理创建事件链，可以逐步或批量创建
3. **执行**：UIBridge 按顺序执行事件，管理时序和数据流
4. **状态管理**：每个事件可以将数据传递给链中的下一个事件

## API 参考

### UIBridge

```typescript
// 注册事件处理器
const unsubscribe = ui.on(eventName, (props, next) => {
  // 处理事件
  next(dataForNextStep);
});

// 链式 API
ui.add(eventName, props).sleep(durationMs).add(nextEventName, nextProps);

// 批量 API
ui.batch([
  { event: eventName, props: eventProps },
  { event: "sleep", props: { duration: timeMs } },
  { event: nextEventName, props: nextProps },
]);

// 清空事件链
ui.clear();
```

### EventBridge

```typescript
// 添加上下文
const contextId = bus.addContext({
  from: "component",
  data: {
    /* 组件数据 */
  },
});

// 监听上下文变更
const unsubscribe = bus.onContextChange((context, from) => {
  // 处理上下文变更
});

// 更新上下文
bus.updateContext({
  id: contextId,
  from: "component",
  data: {
    /* 更新的数据 */
  },
});

// 移除上下文
bus.removeContext(contextId);
```

## 实现策略

1. **逐步实施方法**：

   - 首先定义代表原子 UI 操作的事件
   - 创建监听这些事件的组件
   - 实现链式执行逻辑
   - 添加序列化和批量执行支持

2. **最佳实践**：

   - 保持事件的粒度和可组合性
   - 为 AI 消费提供事件模式文档
   - 战略性地使用 sleep 事件控制动画时序
   - 必要时通过链维护状态

3. **与 AI 集成**：
   - 为 AI 提供事件模式和文档
   - 让 AI 基于用户意图生成事件链
   - 允许 AI 序列化和存储成功的模式

## 应用场景

- **AI 驱动的仪表板**：让 AI 分析数据并编排可视化创建
- **分步教程**：AI 创建根据用户需求定制的引导流程
- **智能表单填写**：AI 组装和填充复杂表单
- **多步骤工作流**：AI 编排整个业务流程
- **动态 UI 生成**：AI 根据用户需求组合 UI 布局

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

本项目基于 MIT 许可证 - 详情请参阅 LICENSE 文件。
