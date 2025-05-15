"use client";

import { useState, useEffect } from "react";
import TodoList from "./components/TodoList";
import WorkflowList from "./components/WorkflowList";
import ReadmeViewer from "./components/ReadmeViewer";
import Link from "next/link";
import { ui, bus } from "../lib/event-bridge/instance";
import { UIEventBatchItem } from "../lib/event-bridge/types";

// Initial sample tasks
const initialTodos = [
  { id: "1", title: "Ask Agent to plan my day", completed: true },
  { id: "2", title: "Let Agent schedule a meeting", completed: false },
  { id: "3", title: "Get Agent to analyze my data", completed: false },
];

// Example batch events
const exampleBatchCode = `// AI Agent generated event sequence
const events: UIEventBatchItem[] = [
  { event: "task.analyze", props: { data: "sales_report.csv" } },
  { event: "sleep", props: { duration: 500 } },
  { event: "chart.create", props: { type: "bar", title: "Sales Analysis" } },
  { event: "sleep", props: { duration: 300 } },
  { event: "notification.show", props: { message: "Analysis complete" } }
];

// Execute the Agent's plan
ui.batch(events);`;

export default function Home() {
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showReadme, setShowReadme] = useState(false);

  // Add an event log entry
  const addLog = (message: string) => {
    setEventLogs((prev) => {
      const newLogs = [
        ...prev,
        `${new Date().toLocaleTimeString()}: ${message}`,
      ];
      // Keep only the most recent 10 logs
      return newLogs.slice(-10);
    });
  };

  // Register global event listeners to record event flow
  useEffect(() => {
    const events = [
      "todo.add",
      "todo.toggle",
      "todo.delete",
      "todo.edit",
      "todo.clearCompleted",
      "workflow.markComplete",
      "workflow.editTask",
      "workflow.markMultiple",
      "workflow.deleteLatest",
    ];

    const unsubscribes = events.map((event) => {
      return ui.on(event, (props, next) => {
        addLog(`Event: ${event}, Params: ${JSON.stringify(props)}`);
        next(props);
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto bg-slate-50">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3 text-slate-800">
          AI Agent UI Orchestration
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Demonstrating how AI Agents can orchestrate UI interactions through serializable event chains
        </p>
        <div className="flex gap-4 justify-center mt-4">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full text-sm font-medium transition-colors"
          >
            {showInfo ? "Hide Concept" : "Show Concept"}
          </button>
          <button 
            onClick={() => setShowReadme(!showReadme)}
            className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full text-sm font-medium transition-colors"
          >
            {showReadme ? "Hide Documentation" : "Show Documentation"}
          </button>
          <Link 
            href="https://github.com/liunian-hub/ag-ui-client" 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-medium transition-colors"
            target="_blank"
          >
            GitHub
          </Link>
        </div>
      </header>

      {showInfo && (
        <div className="mb-8 bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
          <h2 className="text-lg font-semibold text-indigo-800 mb-3">AI Agent UI Orchestration</h2>
          <p className="text-indigo-700 mb-4">
            This project demonstrates how AI Agents can control and orchestrate complex UI interactions
            through serializable event chains.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium text-indigo-800 mb-2">The Problem</h3>
              <p className="text-slate-600 text-sm">
                AI Agents need a way to control UI beyond simple text responses. They need to orchestrate
                complex UI workflows with precise timing and state management.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-medium text-indigo-800 mb-2">The Solution</h3>
              <p className="text-slate-600 text-sm">
                UIBridge provides a serializable event chain API that AI Agents can use to create, schedule,
                and execute complex UI interactions.
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md">
            <h3 className="font-medium text-indigo-800 mb-2">How It Works</h3>
            <pre className="text-sm text-slate-800 font-mono overflow-x-auto">
              {exampleBatchCode}
            </pre>
          </div>
        </div>
      )}

      {showReadme && <ReadmeViewer />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              AI Agent Task Manager
            </h2>
            <p className="text-slate-600 mb-4">
              Below is a demonstration of an AI Agent orchestrating a task management interface. The Agent can
              create, update, and complete tasks through serializable event chains.
            </p>
            <TodoList initialTodos={initialTodos} />
          </div>

          <WorkflowList />
        </div>

        <div className="bg-slate-800 p-5 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Agent Event Log
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            This log shows the events being executed by the UI orchestration system, as if they were
            being directed by an AI Agent.
          </p>
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-sm h-[500px] overflow-y-auto border border-slate-700">
            {eventLogs.length === 0 ? (
              <p className="text-slate-500">Waiting for Agent events...</p>
            ) : (
              <ul className="space-y-1">
                {eventLogs.map((log, index) => (
                  <li key={index} className="pb-1 border-b border-slate-800">
                    &gt; {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
