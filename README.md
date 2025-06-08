# AG-UI-Client

<div align="center">
  <img src="https://placehold.co/600x300?text=UIBridge+Agent+Orchestration" alt="AG-UI-Client Logo">
  <p>
    <em>Enabling AI Agents to orchestrate complex UI interactions through serializable event chains</em>
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#api-reference">API Reference</a> •
    <a href="#use-cases">Use Cases</a>
  </p>
  <p>
    <a href="README_zh.md">中文文档</a>
  </p>
</div>

## Overview

AG-UI-Client demonstrates a powerful new paradigm that enables AI agents to orchestrate complex UI interactions. 

### The Problem

Current AI agent integrations with user interfaces face significant limitations:

- AI systems provide only text-based outputs or render simple templates
- UI orchestration requires rigid, pre-defined interaction paths
- State management between UI components is difficult to coordinate
- Timing and sequencing of operations cannot be precisely controlled

### The Solution: UIBridge

UIBridge provides a **declarative + consumable** event chain architecture that empowers AI agents to create, schedule, and execute complex UI interactions:

```javascript
// AI Agent declares workflow but doesn't execute immediately
ui.chain("data-analysis")
  .add("data.analyze", { source: "quarterly_report.csv" })
  .sleep(500)
  .add("chart.generate", { type: "bar", title: "Revenue Breakdown" })
  .sleep(300)
  .add("recommendations.display", { insights: ["Focus on SaaS growth", "Reduce hardware costs"] })
  .build();

// Execute when ready - automatically consumed and deleted
await ui.consume("data-analysis");
```

## Features

- **🎯 Declarative Workflow Definition**: Define complete workflows without immediate execution
- **⚡ On-Demand Consumption**: Execute workflows at the perfect timing with `ui.consume()`
- **🔄 One-Time Execution**: Workflows are automatically deleted after consumption, preventing duplicate execution
- **⏱️ Perfect Timing Control**: Solve async state synchronization issues naturally
- **🧩 Component Agnostic**: Works with any component framework (React, Vue, etc.)
- **📡 Network-friendly**: JSON-serializable workflow definitions for remote execution
- **↔️ Bidirectional**: UI components can send data back to AI agents
- **🎪 Simple & Intuitive**: Clean API design focused on ease of use

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/HubbleVision/ag-ui-client

# Install dependencies
cd ag-ui-client
npm install

# Run the development server
npm run dev
```

### Basic Usage

1. Define event handlers for your UI components:

```jsx
// Register event listeners
ui.on("chart.create", (props, next) => {
  const { type, data, title } = props;
  createChart(type, data, title);
  next({ chartId: generatedChartId });
});

ui.on("recommendations.display", (props, next) => {
  const { insights, prev } = props;
  const { chartId } = prev; // Get data from previous step
  displayRecommendations(chartId, insights);
  next();
});
```

2. Declare workflows and consume when ready:

```javascript
// Declarative API - Define workflow without executing
ui.chain("analysis-workflow")
  .add("chart.create", { type: "bar", data: salesData, title: "Q3 Sales" })
  .sleep(500)
  .add("recommendations.display", { insights: aiGeneratedInsights })
  .build();

// Consume when the timing is right
await ui.consume("analysis-workflow");

// Or consume based on conditions
if (dataReady && userConfirmed) {
  await ui.consume("analysis-workflow");
}
```

## How It Works

1. **Event Definition**: Define UI events that components can listen for and react to
2. **Workflow Declaration**: AI agents declare event workflows using `ui.chain()` but don't execute immediately
3. **Controlled Consumption**: Execute workflows at the perfect timing using `ui.consume()`
4. **Automatic Cleanup**: Workflows are automatically deleted after consumption, preventing duplicate execution

## Architecture Philosophy

UIBridge follows a **"Declare First, Execute When Ready"** philosophy that solves complex timing and state synchronization issues elegantly:

### Traditional Problems
- **Immediate Execution**: `ui.add()` starts executing immediately, causing timing issues
- **State Synchronization**: Async operations and UI updates happen at different times
- **Duplicate Execution**: No built-in protection against running the same workflow multiple times

### Our Solution
- **Declarative Definition**: `ui.chain().build()` only defines workflows, no immediate execution
- **Controlled Timing**: `ui.consume()` executes exactly when conditions are right
- **Automatic Cleanup**: One-time consumption prevents accidental re-execution
- **Natural State Sync**: Perfect timing control eliminates state synchronization issues

## API Reference

### UIBridge

```typescript
// Register an event handler
const unsubscribe = ui.on(eventName, (props, next) => {
  // Handle event
  next(dataForNextStep);
});

// Declarative API - Define workflows
ui.chain(workflowId)
  .add(eventName, props)
  .sleep(durationMs)
  .add(nextEventName, nextProps)
  .build();

// Consumption API - Execute when ready
await ui.consume(workflowId);

// Utility methods
ui.hasChain(workflowId);        // Check if workflow exists
ui.getChains();                 // Get all declared workflows
ui.clear(workflowId);           // Remove specific workflow
ui.clear();                     // Remove all workflows
```

#### Solving Async State Synchronization

The declarative + consumable pattern naturally solves async state synchronization issues:

```typescript
// Component A: Table with async filtering
ui.on("context.filter", (props, next) => {
  const { keyword } = props;
  setIsLoading(true);
  
  // Async filtering
  setTimeout(() => {
    const filtered = data.filter(row => 
      row.name.includes(keyword)
    );
    setFilteredData(filtered);
    setIsLoading(false);
    next({ filteredCount: filtered.length });
  }, 1000);
});

ui.on("table.selectAll", (props, next) => {
  // This will always operate on the latest filtered data
  // because consume() controls the timing
  const selectedRows = filteredData.map(row => row.id);
  next({ selectedCount: selectedRows.length });
});

// Component B: Chat declaring workflow
ui.chain("filter-and-select")
  .add("context.filter", { keyword: "apple" })
  .sleep(1200) // Wait for filtering to complete
  .add("table.selectAll", {})
  .build();

// Consume when conditions are right
await ui.consume("filter-and-select");
```

### EventBridge

```typescript
// Add context
const contextId = bus.addContext({
  from: "component",
  data: { /* component data */ }
});

// Listen for context changes
const unsubscribe = bus.onContextChange((context, from) => {
  // Handle context change
});

// Update context
bus.updateContext({
  id: contextId,
  from: "component",
  data: { /* updated data */ }
});

// Remove context
bus.removeContext(contextId);
```

## Implementation Strategies

1. **Step-by-Step Approach**:
   - Start by defining events that represent atomic UI operations
   - Create components that listen for these events
   - Implement chain execution logic
   - Add serialization and batch execution support

2. **Best Practices**:
   - Keep events granular and composable
   - Document event schemas for AI consumption
   - Use sleep events strategically for animation timing
   - Maintain state through the chain when needed

3. **Integration with AI**:
   - Provide AI with event schemas and documentation
   - Let AI generate event chains based on user intent
   - Allow AI to serialize and store successful patterns

## Use Cases

- **AI-driven Dashboards**: Let AI analyze data and orchestrate visualization creation
- **Step-by-step Tutorials**: AI creates custom onboarding flows tailored to user needs
- **Intelligent Form Filling**: AI assembles and populates complex forms
- **Multi-step Workflows**: AI orchestrates entire business processes
- **Dynamic UI Generation**: AI composes UI layouts based on user needs
- **Async State Coordination**: Synchronize UI operations that depend on async state updates across multiple components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
