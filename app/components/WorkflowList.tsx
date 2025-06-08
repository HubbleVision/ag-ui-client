"use client";

import { useState } from "react";
import { ui } from "../../lib/event-bridge/instance";

interface Workflow {
  id: string;
  name: string;
  description: string;
  workflow: () => void;
}

const workflows: Workflow[] = [
  {
    id: "simple-declare",
    name: "🎯 Declarative: Create Task",
    description: "AI Agent declares a workflow, then consumes it when ready",
    workflow: () => {
      // Declare workflow definition
      ui.chain("create-research-task")
        .add("todo.add", { title: "Research competitors' pricing models" })
        .build();
      
      console.log("📝 Workflow declared: create-research-task");
      
      // Simulate consumption at the right time
      setTimeout(() => {
        console.log("🚀 Starting workflow consumption");
        ui.consume("create-research-task");
      }, 800);
    },
  },
  {
    id: "declare-with-timing",
    name: "🎯 Declarative: Schedule & Complete",
    description: "AI Agent declares a timed workflow with precise control",
    workflow: () => {
      // Declare timed workflow definition
      ui.chain("schedule-and-complete")
        .add("todo.add", { title: "Generate monthly analytics report" })
        .sleep(1000)
        .add("workflow.markComplete", {})
        .build();
      
      console.log("📝 Timed workflow declared");
      
      // Execute after user confirmation
      setTimeout(() => {
        console.log("✅ User confirmed, starting workflow execution");
        ui.consume("schedule-and-complete");
      }, 500);
    },
  },
  {
    id: "declare-refine-execute",
    name: "🎯 Declarative: Create → Refine → Complete",
    description: "AI Agent declares, refines, then executes at perfect timing",
    workflow: () => {
      // Step 1: Declare initial workflow
      ui.chain("draft-email-workflow")
        .add("todo.add", { title: "Draft email to marketing team" })
        .sleep(500)
        .add("workflow.editTask", { newTitle: "Draft email to marketing team about Q3 campaign" })
        .sleep(500)
        .add("workflow.markComplete", {})
        .build();
      
      console.log("📝 Email workflow declared");
      
      // Simulate AI getting more information, then deciding to execute
      setTimeout(() => {
        console.log("🤖 AI gained more context information, starting execution");
        ui.consume("draft-email-workflow");
      }, 1200);
    },
  },
  {
    id: "declare-multi-step",
    name: "🎯 Declarative: Multi-step Plan",
    description: "AI Agent declares complex multi-step workflow for controlled execution",
    workflow: () => {
      // Declare complex multi-step workflow
      ui.chain("customer-feedback-analysis")
        .add("todo.add", { title: "Gather customer feedback data" })
        .sleep(300)
        .add("todo.add", { title: "Analyze sentiment patterns" })
        .sleep(300)
        .add("todo.add", { title: "Create visualization dashboard" })
        .sleep(500)
        .add("workflow.markMultiple", { indexes: [0, 1] })
        .meta({ priority: "high", department: "analytics" })
        .build();
      
      console.log("📊 Complex analysis workflow declared with metadata");
      
      // Execute after resources become available
      setTimeout(() => {
        console.log("💻 Analysis resources ready, starting execution");
        ui.consume("customer-feedback-analysis");
      }, 1000);
    },
  },
  {
    id: "declare-conditional",
    name: "🎯 Declarative: Conditional Execution", 
    description: "AI Agent declares workflow but only executes based on conditions",
    workflow: () => {
      // Declare conditional workflow
      ui.chain("conditional-vendor-call")
        .add("todo.add", { title: "Schedule call with vendor" })
        .sleep(1000)
        .add("workflow.deleteLatest", {})
        .build();
      
      console.log("🤔 Conditional workflow declared");
      
      // Simulate condition checking
      setTimeout(() => {
        const shouldExecute = Math.random() > 0.5;
        if (shouldExecute) {
          console.log("✅ Condition met, executing workflow");
          ui.consume("conditional-vendor-call");
        } else {
          console.log("❌ Condition not met, clearing workflow");
          ui.clear("conditional-vendor-call");
        }
      }, 1500);
    },
  },
  {
    id: "declare-batch-workflow",
    name: "🎯 Declarative: Batch Definition",
    description: "AI Agent uses batch API to declare complex workflows",
    workflow: () => {
      // Use batch API to declare workflow
      ui.chain("project-management-workflow")
        .batch([
          { event: "todo.add", props: { title: "Review project requirements" } },
          { event: "sleep", props: { duration: 500 } },
          { event: "todo.add", props: { title: "Allocate team resources" } },
          { event: "sleep", props: { duration: 500 } },
          { event: "workflow.markComplete", props: {} },
        ])
        .build();
      
      console.log("📋 Batch workflow declared");
      
      // Execute after project meeting
      setTimeout(() => {
        console.log("🏢 Project meeting ended, executing management workflow");
        ui.consume("project-management-workflow");
      }, 800);
    },
  },
  {
    id: "declare-serialized",
    name: "🎯 Declarative: Remote Plan",
    description: "Executing serialized plan from remote AI agent using new architecture",
    workflow: () => {
      // Simulate serialized workflow received from remote AI
      const remoteWorkflow = [
        { event: "todo.add", props: { title: "Analyze quarterly reports" } },
        { event: "sleep", props: { duration: 400 } },
        { event: "todo.add", props: { title: "Schedule team review meeting" } },
        { event: "sleep", props: { duration: 800 } },
        { event: "workflow.markMultiple", props: { indexes: [0, 1] } }
      ];
      
      // Declare remote workflow
      ui.chain("remote-quarterly-analysis")
        .batch(remoteWorkflow)
        .meta({ source: "remote-ai", timestamp: Date.now() })
        .build();
      
      console.log("🌐 Remote AI workflow declared");
      
      // Execute after local validation
      setTimeout(() => {
        console.log("🔐 Local validation passed, executing remote workflow");
        ui.consume("remote-quarterly-analysis");
      }, 1000);
    },
  },
];

export default function WorkflowList() {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, string>>({});

  const executeWorkflow = (workflow: Workflow) => {
    setActiveWorkflow(workflow.id);
    setWorkflowStatus(prev => ({ ...prev, [workflow.id]: "Declaring..." }));
    
    workflow.workflow();
    
    // Update status
    setTimeout(() => {
      setWorkflowStatus(prev => ({ ...prev, [workflow.id]: "Declared" }));
    }, 200);
    
    // Simulate execution completion
    setTimeout(() => {
      setWorkflowStatus(prev => ({ ...prev, [workflow.id]: "Consumed" }));
      setActiveWorkflow(null);
    }, 3000);
  };

  return (
    <div className="mt-12 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-white border-b border-gray-600 pb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        🚀 Declarative AI Workflow Demonstrations
      </h2>
      <p className="text-gray-300 mb-6">
        Demonstrates how AI Agents use the new declarative + consumable architecture for precise workflow execution timing control.
        Each example embodies the "declare first, consume when ready" design philosophy.
      </p>
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={`
              border border-gray-600 rounded-lg p-4 
              hover:bg-gray-700 hover:border-gray-500 transition-all 
              cursor-pointer shadow-sm bg-gray-800
              ${activeWorkflow === workflow.id ? 'ring-2 ring-indigo-400' : ''}
            `}
            onClick={() => executeWorkflow(workflow)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-200">{workflow.name}</h3>
              <span
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  activeWorkflow === workflow.id
                    ? "bg-indigo-900 text-indigo-200"
                    : workflowStatus[workflow.id] === "Consumed"
                    ? "bg-green-900 text-green-200"
                    : workflowStatus[workflow.id] === "Declared"
                    ? "bg-yellow-900 text-yellow-200"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {activeWorkflow === workflow.id ? "Declaring..." : 
                 workflowStatus[workflow.id] === "Consumed" ? "✅ Consumed" :
                 workflowStatus[workflow.id] === "Declared" ? "📝 Declared" :
                 "🎯 Try It"}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">{workflow.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-emerald-900 border border-emerald-700 rounded-lg">
        <h4 className="font-semibold text-emerald-200 mb-2">💡 Declarative Architecture Advantages</h4>
        <ul className="text-emerald-300 text-sm space-y-1">
          <li>• <strong>Declare First, Execute Later</strong>: Gives AI more time to think and validate</li>
          <li>• <strong>Perfect Timing Control</strong>: Consume workflows at the most appropriate time</li>
          <li>• <strong>Conditional Execution</strong>: Can decide whether to execute based on conditions</li>
          <li>• <strong>One-time Consumption</strong>: Prevents accidental duplicate execution</li>
          <li>• <strong>State Sync Naturally Solved</strong>: Consumption timing is fully controllable</li>
        </ul>
      </div>
    </div>
  );
}
