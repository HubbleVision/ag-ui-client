"use client";

import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

// English README content
const englishReadme = `
# AG-UI-Client: AI Agent UI Orchestration

## About

AG-UI-Client demonstrates a powerful new paradigm: enabling AI agents to orchestrate complex UI interactions through serializable event chains.

## The Problem

Current AI agent integrations with user interfaces are limited, often constrained to:
- Text-based outputs and responses
- Simple template rendering
- Limited, pre-defined UI interactions

AI agents struggle to:
- Orchestrate complex UI workflows with precise timing
- Manage state transitions across UI components
- Create reusable UI interaction patterns

## The Solution: UIBridge

UIBridge provides a serializable event chain architecture that AI agents can use to create, schedule, and execute complex UI interactions.

\`\`\`javascript
// AI Agent can generate this event sequence
const events = [
  { event: "data.analyze", props: { source: "quarterly_report.csv" } },
  { event: "sleep", props: { duration: 500 } },
  { event: "chart.generate", props: { type: "bar", title: "Revenue Breakdown" } },
  { event: "sleep", props: { duration: 300 } },
  { event: "recommendations.display", props: { insights: ["Focus on SaaS growth", "Reduce hardware costs"] } }
];

// Execute the AI-generated plan
ui.batch(events);
\`\`\`

## Key Features

- **Serializable Event Chains**: AI agents can create, serialize, and transmit complete UI workflows
- **Timing Control**: Precise control over timing and sequence of UI operations
- **State Management**: Pass data between steps in the workflow
- **Component Agnostic**: Works with any component framework
- **Network-friendly**: JSON-serializable format for remote execution
- **Bidirectional**: UI components can send data back to AI agents

## How It Works

1. **Event Definition**: Define UI events that components can listen for and react to
2. **Chain Creation**: AI agents create event chains, either step-by-step or as a batch
3. **Execution**: UIBridge executes events in sequence, managing timing and data flow
4. **State Management**: Each event can pass data to the next in the chain

## Use Cases

- **AI-driven Dashboards**: Let AI analyze data and orchestrate visualization creation
- **Step-by-step Tutorials**: AI creates custom onboarding flows tailored to user needs
- **Intelligent Form Filling**: AI assembles and populates complex forms
- **Multi-step Workflows**: AI orchestrates entire business processes
- **Dynamic UI Generation**: AI composes UI layouts based on user needs
`;

// Chinese README content
const chineseReadme = `
# AG-UI-Client: AI 代理 UI 编排

## 关于项目

AG-UI-Client 展示了一种强大的新范式：使 AI 代理能够通过可序列化的事件链编排复杂的 UI 交互。

## 问题

当前 AI 代理与用户界面的集成受到限制，通常局限于：
- 基于文本的输出和响应
- 简单的模板渲染
- 有限的、预定义的 UI 交互

AI 代理难以：
- 编排具有精确时序的复杂 UI 工作流
- 管理跨 UI 组件的状态转换
- 创建可复用的 UI 交互模式

## 解决方案：UIBridge

UIBridge 提供了一个可序列化的事件链架构，AI 代理可以使用它来创建、调度和执行复杂的 UI 交互。

\`\`\`javascript
// AI 代理可以生成这样的事件序列
const events = [
  { event: "data.analyze", props: { source: "quarterly_report.csv" } },
  { event: "sleep", props: { duration: 500 } },
  { event: "chart.generate", props: { type: "bar", title: "收入明细" } },
  { event: "sleep", props: { duration: 300 } },
  { event: "recommendations.display", props: { insights: ["专注于 SaaS 增长", "降低硬件成本"] } }
];

// 执行 AI 生成的计划
ui.batch(events);
\`\`\`

## 主要特点

- **可序列化事件链**：AI 代理可以创建、序列化和传输完整的 UI 工作流
- **时序控制**：精确控制 UI 操作的时序和顺序
- **状态管理**：在工作流步骤之间传递数据
- **组件无关**：适用于任何组件框架
- **网络友好**：JSON 可序列化格式，适合远程执行
- **双向通信**：UI 组件可以将数据发送回 AI 代理

## 工作原理

1. **事件定义**：定义 UI 事件，组件可以监听并对其做出反应
2. **链式创建**：AI 代理创建事件链，可以逐步创建或批量创建
3. **执行**：UIBridge 按顺序执行事件，管理时序和数据流
4. **状态管理**：每个事件可以将数据传递给链中的下一个事件

## 用例

- **AI 驱动的仪表板**：让 AI 分析数据并编排可视化创建
- **分步教程**：AI 创建根据用户需求定制的引导流程
- **智能表单填写**：AI 组装和填充复杂表单
- **多步骤工作流**：AI 编排整个业务流程
- **动态 UI 生成**：AI 根据用户需求组合 UI 布局
`;

export default function ReadmeViewer() {
  const [showLanguage, setShowLanguage] = useState<"en" | "zh">("en");

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Project Documentation</h2>
        <LanguageSwitcher 
          showLanguage={showLanguage} 
          onLanguageChange={setShowLanguage} 
        />
      </div>
      
      <div className="prose prose-slate max-w-none">
        <div className="markdown-body">
          {showLanguage === "en" ? (
            <div dangerouslySetInnerHTML={{ __html: marked(englishReadme) }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: marked(chineseReadme) }} />
          )}
        </div>
      </div>
    </div>
  );
}

// Simple markdown renderer function
function marked(markdown: string): string {
  // Convert headings
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mt-6 mb-3 text-gray-900">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-medium mt-3 mb-2 text-gray-800">$1</h4>');

  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="bg-slate-800 text-slate-100 p-4 rounded-md overflow-x-auto my-4"><code>${code}</code></pre>`;
  });

  // Convert bullet points
  html = html.replace(/^- (.*$)/gm, '<li class="ml-6 list-disc text-gray-700">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n)+/g, (match) => {
    return `<ul class="my-3">${match}</ul>`;
  });

  // Convert numbered lists
  html = html.replace(/^\d+\. (.*$)/gm, '<li class="ml-6 list-decimal text-gray-700">$1</li>');

  // Convert paragraphs
  html = html.replace(/^(?!<[uh])(?!$)(.+)$/gm, '<p class="my-3 text-gray-700">$1</p>');

  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>');

  // Convert italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Fix empty lines
  html = html.replace(/<\/ul>\n<p><\/p>/g, '</ul>');

  return html;
} 