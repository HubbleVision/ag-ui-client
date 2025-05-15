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

UIBridge provides a serializable event chain architecture that empowers AI agents to create, schedule, and execute complex UI interactions:

```javascript
// AI Agent generates this event sequence based on user requirements
const events = [
  { event: "data.analyze", props: { source: "quarterly_report.csv" } },
  { event: "sleep", props: { duration: 500 } },
  { event: "chart.generate", props: { type: "bar", title: "Revenue Breakdown" } },
  { event: "sleep", props: { duration: 300 } },
  { event: "recommendations.display", props: { insights: ["Focus on SaaS growth", "Reduce hardware costs"] } }
];

// Execute the AI-generated plan
ui.batch(events);
```

## Features

- **🔄 Serializable Event Chains**: AI agents can create, serialize, and transmit complete UI workflows
- **⏱️ Precise Timing Control**: Control exact timing and sequence of UI operations
- **🔄 State Management**: Pass data between steps in the workflow
- **🧩 Component Agnostic**: Works with any component framework (React, Vue, etc.)
- **📡 Network-friendly**: JSON-serializable format for remote execution
- **↔️ Bidirectional**: UI components can send data back to AI agents
- **🔌 Two APIs**: Support for both chain-style API (`ui.add().add()`) and batch API (`ui.batch([])`)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/liunian-hub/ag-ui-client.git

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

2. Let AI generate and execute event chains:

```javascript
// Chain-style API
ui.add("chart.create", { type: "bar", data: salesData, title: "Q3 Sales" })
  .sleep(500)
  .add("recommendations.display", { insights: aiGeneratedInsights });

// Or batch API (serializable)
ui.batch([
  { event: "chart.create", props: { type: "bar", data: salesData, title: "Q3 Sales" } },
  { event: "sleep", props: { duration: 500 } },
  { event: "recommendations.display", props: { insights: aiGeneratedInsights } }
]);
```

## How It Works

1. **Event Definition**: Define UI events that components can listen for and react to
2. **Chain Creation**: AI agents create event chains, either step-by-step or as a batch
3. **Execution**: UIBridge executes events in sequence, managing timing and data flow
4. **State Management**: Each event can pass data to the next in the chain


## API Reference

### UIBridge

```typescript
// Register an event handler
const unsubscribe = ui.on(eventName, (props, next) => {
  // Handle event
  next(dataForNextStep);
});

// Chain-style API
ui.add(eventName, props)
  .sleep(durationMs)
  .add(nextEventName, nextProps);

// Batch API
ui.batch([
  { event: eventName, props: eventProps },
  { event: "sleep", props: { duration: timeMs } },
  { event: nextEventName, props: nextProps }
]);

// Clear the event chain
ui.clear();
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
