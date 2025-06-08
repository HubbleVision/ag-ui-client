"use client";

import { useState, useEffect } from "react";
import { ui } from "../../lib/event-bridge/instance";

// Mock context object
const context = {
  filterKeyword: "",
  isFiltering: false,
  
  // Mock async filtering listener
  on: (event: string, callback: (data: any) => void) => {
    if (event === "filter") {
      // Simulate async filtering process
      setTimeout(() => {
        context.isFiltering = false;
        callback({ 
          keyword: context.filterKeyword,
          filtered: true,
          timestamp: Date.now()
        });
      }, 1000); // 1 second async delay
    }
  },
  
  // Update filter keyword
  updateFilter: (keyword: string) => {
    context.filterKeyword = keyword;
    context.isFiltering = true;
    // Trigger filter event
    context.on("filter", () => {});
  }
};

// Original Problem Scenario: Component A (Table Component)
function ProblematicTableComponent() {
  const [data, setData] = useState([
    { id: 1, name: "Task 1", status: "pending" },
    { id: 2, name: "Task 2", status: "completed" },
    { id: 3, name: "Important Task", status: "pending" },
  ]);
  const [filteredData, setFilteredData] = useState(data);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    // ❌ Original problematic approach: ui.on and context.on listening simultaneously
    const unsubSelectAll = ui.on("table.selectAll", (props, next) => {
      console.log("🔴 Problem Scenario: ui.on executes immediately, but data may still be filtering");
      console.log("Current filteredData length:", filteredData.length);
      console.log("context.isFiltering:", context.isFiltering);
      
      // This operates on unfiltered data!
      setSelectedCount(filteredData.length);
      next();
    });

    // context.on listens for filter completion
    context.on("filter", (result) => {
      console.log("🔄 Filtering completed:", result);
      const filtered = data.filter(item => 
        item.name.includes(context.filterKeyword) || context.filterKeyword === ""
      );
      setFilteredData(filtered);
    });

    return () => {
      unsubSelectAll();
    };
  }, [data, filteredData]); // Note this dependency

  return (
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
      <h3 className="font-semibold text-red-400 mb-3">❌ Original Problem Scenario: Component A (Table)</h3>
      <div className="text-sm text-gray-300 mb-3">
        Filter keyword: "{context.filterKeyword}" | Is filtering: {context.isFiltering ? "Yes" : "No"}
      </div>
      <div className="space-y-2">
        {filteredData.map(item => (
          <div key={item.id} className="p-2 bg-gray-700 rounded">
            {item.name} - {item.status}
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 bg-red-950 border border-red-800 rounded">
        <strong className="text-red-200">Selected: {selectedCount} items</strong>
        <div className="text-xs text-red-300">
          ⚠️ This number may be incorrect because selection happens while data is still filtering
        </div>
      </div>
    </div>
  );
}

// Original Problem Scenario: Component B (Chat Component)
function ProblematicChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);

  const simulateAssistantResponse = () => {
    const filterKeyword = "Important";
    
    console.log("🤖 AI Assistant starts responding...");
    setMessages(prev => [...prev, `AI: Searching for tasks containing "${filterKeyword}"...`]);
    
    // ❌ Original problematic approach: immediate context update + ui.add
    setTimeout(() => {
      console.log("📝 Updating context filter condition");
      context.updateFilter(filterKeyword); // This triggers 1-second async filtering
      
      console.log("⚡ Immediately executing ui.add - This is the problem!");
      ui.add("table.selectAll", {}); // This fires immediately, but filtering isn't complete
      
      setMessages(prev => [...prev, "AI: Selected all matching tasks"]);
    }, 500);
  };

  return (
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
      <h3 className="font-semibold text-red-400 mb-3">❌ Original Problem Scenario: Component B (Chat)</h3>
      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm p-2 bg-gray-700 rounded">
            {msg}
          </div>
        ))}
      </div>
      <button
        onClick={simulateAssistantResponse}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        🤖 Simulate AI Assistant Response (Problem Scenario)
      </button>
    </div>
  );
}

// New Architecture Solution: Component A (Table Component)
function ImprovedTableComponent() {
  const [data, setData] = useState([
    { id: 1, name: "Task 1", status: "pending" },
    { id: 2, name: "Task 2", status: "completed" },
    { id: 3, name: "Important Task", status: "pending" },
  ]);
  const [filteredData, setFilteredData] = useState(data);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    // ✅ New architecture: only listen to data events, don't directly handle workflows
    const unsubSelectAll = ui.on("table.selectAll", (props, next) => {
      console.log("✅ New Architecture: Using current filtered data");
      console.log("Current filteredData length:", filteredData.length);
      console.log("context.isFiltering:", context.isFiltering);
      
      // Now this operates on correctly filtered data
      setSelectedCount(filteredData.length);
      next();
    });

    // context.on listens for filter completion
    context.on("filter", (result) => {
      console.log("🔄 Filtering completed:", result);
      const filtered = data.filter(item => 
        item.name.includes(context.filterKeyword) || context.filterKeyword === ""
      );
      setFilteredData(filtered);
    });

    return () => {
      unsubSelectAll();
    };
  }, [data, filteredData]);

  return (
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
      <h3 className="font-semibold text-green-400 mb-3">✅ New Architecture Solution: Component A (Table)</h3>
      <div className="text-sm text-gray-300 mb-3">
        Filter keyword: "{context.filterKeyword}" | Is filtering: {context.isFiltering ? "Yes" : "No"}
      </div>
      <div className="space-y-2">
        {filteredData.map(item => (
          <div key={item.id} className="p-2 bg-gray-700 rounded">
            {item.name} - {item.status}
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 bg-green-950 border border-green-800 rounded">
        <strong className="text-green-200">Selected: {selectedCount} items</strong>
        <div className="text-xs text-green-300">
          ✅ This number is correct because consumption timing is controllable
        </div>
      </div>
    </div>
  );
}

// New Architecture Solution: Component B (Chat Component)
function ImprovedChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);

  const simulateAssistantResponse = () => {
    const filterKeyword = "Important";
    
    console.log("🤖 AI Assistant starts responding...");
    setMessages(prev => [...prev, `AI: Searching for tasks containing "${filterKeyword}"...`]);
    
    // ✅ New architecture solution: Declarative + delayed consumption
    setTimeout(() => {
      console.log("📝 Updating context filter condition");
      context.updateFilter(filterKeyword); // Triggers 1-second async filtering
      
      console.log("🎯 Declaring workflow, but not executing immediately");
      ui.chain("filter-and-select-workflow")
        .add("context.filter", { keyword: filterKeyword })
        .sleep(1200) // Wait for filtering to complete
        .add("table.selectAll", {})
        .meta({ description: "Select all matching items after filtering" })
        .build();
      
      setMessages(prev => [...prev, "AI: Workflow declared, waiting for filtering to complete..."]);
      
      // Consume workflow at the right time
      setTimeout(() => {
        console.log("🚀 Filtering complete, starting workflow consumption");
        ui.consume("filter-and-select-workflow");
        setMessages(prev => [...prev, "AI: ✅ Selected all matching tasks"]);
      }, 1300); // Ensure filtering is complete before execution
    }, 500);
  };

  return (
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
      <h3 className="font-semibold text-green-400 mb-3">✅ New Architecture Solution: Component B (Chat)</h3>
      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm p-2 bg-gray-700 rounded">
            {msg}
          </div>
        ))}
      </div>
      <button
        onClick={simulateAssistantResponse}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-2"
      >
        🤖 Simulate AI Assistant Response (New Architecture)
      </button>
      {ui.hasChain("filter-and-select") && (
        <div className="mt-2 p-2 bg-yellow-900 border border-yellow-700 rounded">
          <div className="text-yellow-200 text-sm">
            📝 Workflow "filter-and-select" has been declared. Click to consume:
          </div>
          <button
            onClick={() => ui.consume("filter-and-select")}
            className="mt-1 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
          >
            🚀 Consume Workflow
          </button>
        </div>
      )}
    </div>
  );
}

export default function OriginalScenarioExample() {
  const [selectedExample, setSelectedExample] = useState<"problem" | "solution">("problem");

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-800 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-white">
        🎯 Original State Sync Problem vs New Architecture Solution
      </h2>
      
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setSelectedExample("problem")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedExample === "problem"
                ? "bg-red-900 text-red-200 border border-red-700"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ❌ Original Problem Scenario
          </button>
          <button
            onClick={() => setSelectedExample("solution")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedExample === "solution"
                ? "bg-green-900 text-green-200 border border-green-700"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ✅ New Architecture Solution
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {selectedExample === "problem" ? (
          <>
            <ProblematicChatComponent />
            <ProblematicTableComponent />
          </>
        ) : (
          <>
            <ImprovedChatComponent />
            <ImprovedTableComponent />
          </>
        )}
      </div>

      <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
        <h3 className="font-semibold text-blue-200 mb-3">📚 Core Problem & Solution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-red-300 mb-2">❌ Original Problem</h4>
            <ul className="text-red-200 text-sm space-y-1">
              <li>• context.updateFilter() triggers async filtering</li>
              <li>• ui.add() executes immediately, but data is still filtering</li>
              <li>• ui.on event handlers operate on unfiltered data</li>
              <li>• Incorrect row count, timing conflicts</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-green-300 mb-2">✅ New Architecture Solution</h4>
            <ul className="text-green-200 text-sm space-y-1">
              <li>• ui.chain() only declares workflows, doesn't execute immediately</li>
              <li>• sleep() waits for async filtering to complete</li>
              <li>• ui.consume() executes at perfect timing</li>
              <li>• One-time consumption prevents duplicate execution</li>
              <li>• Timing is fully controllable, state sync naturally solved</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-200 mb-3">💻 Code Comparison</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h5 className="text-red-300 font-medium mb-2">❌ Original Problematic Approach</h5>
              <pre className="text-sm bg-red-950 p-3 rounded border overflow-x-auto text-red-200">
{`// Component B: Chat Component
const handleAssistantResponse = () => {
  // Update filter condition (async 1s)
  context.updateFilter("Important");
  
  // Execute immediately - Problem here!
  ui.add("table.selectAll", {});
  // Filtering not complete yet, operating on old data
};

// Component A: Table Component
ui.on("table.selectAll", (props, next) => {
  // This gets unfiltered data
  setSelectedCount(filteredData.length);
  next();
});`}
              </pre>
            </div>
            
            <div>
              <h5 className="text-green-300 font-medium mb-2">✅ New Architecture Approach</h5>
              <pre className="text-sm bg-green-950 p-3 rounded border overflow-x-auto text-green-200">
{`// Component B: Chat Component  
const handleAssistantResponse = () => {
  // Update filter condition (async 1s)
  context.updateFilter("Important");
  
  // Declare workflow, don't execute immediately
  ui.chain("filter-and-select")
    .add("context.filter", { keyword: "Important" })
    .sleep(1200) // Wait for filtering to complete
    .add("table.selectAll", {})
    .build();
  
  // Consume at the right time
  setTimeout(() => {
    ui.consume("filter-and-select");
  }, 1300);
};

// Component A: Table Component (no change needed)
ui.on("table.selectAll", (props, next) => {
  // Now gets correctly filtered data
  setSelectedCount(filteredData.length);
  next();
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 