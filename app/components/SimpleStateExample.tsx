"use client";

import { useState, useEffect } from "react";
import { ui } from "../../lib/event-bridge/instance";

// Mock table data type
interface TableRow {
  id: string;
  name: string;
  value: number;
}

// Table Component - corresponds to Component A in user's description
export function SimpleTableComponent() {
  const [data, setData] = useState<TableRow[]>([]);
  const [filteredData, setFilteredData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filterKeyword, setFilterKeyword] = useState("");

  useEffect(() => {
    // Load initial data
    const mockData: TableRow[] = [
      { id: "1", name: "Apple", value: 100 },
      { id: "2", name: "Banana", value: 80 },
      { id: "3", name: "Cherry", value: 120 },
      { id: "4", name: "Date", value: 90 },
      { id: "5", name: "Elderberry", value: 110 },
    ];
    setData(mockData);
    setFilteredData(mockData);
  }, []);

  useEffect(() => {
    // Listen to context filter events
    const unsubscribe = ui.on("context.filter", (props, next) => {
      const { keyword } = props;
      setFilterKeyword(keyword);
      setIsLoading(true);
      
      // Simulate async filtering
      setTimeout(() => {
        const filtered = data.filter(row => 
          row.name.toLowerCase().includes(keyword.toLowerCase())
        );
        setFilteredData(filtered);
        setIsLoading(false);
        console.log(`📊 Data filtering completed, keyword: "${keyword}", results: ${filtered.length} items`);
        next({ filteredCount: filtered.length });
      }, 1000); // Simulate 1 second async processing time
    });

    return unsubscribe;
  }, [data]);

  useEffect(() => {
    // Listen to select all rows event
    const unsubscribe = ui.on("table.selectAll", (props, next) => {
      // No need to wait for state now, consume will be called at the right time
      const allIds = filteredData.map(row => row.id);
      setSelectedRows(allIds);
      
      console.log(`✅ Selected ${allIds.length} rows (based on current filtered data)`);
      
      next({ 
        selectedCount: allIds.length,
        selectedRows: allIds,
        message: `Successfully selected ${allIds.length} rows`
      });
    });

    return unsubscribe;
  }, [filteredData]); // Depends on filteredData to ensure always based on latest data

  return (
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
      <h3 className="font-semibold text-indigo-400 mb-3">📊 Component A (Table)</h3>
      <div className="text-sm text-gray-300 mb-3">
        Filter keyword: "{filterKeyword}" | Rows: {filteredData.length}
      </div>
      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
        {filteredData.map(item => (
          <div key={item.id} className={`p-2 rounded text-sm ${
            selectedRows.includes(item.id) ? 'bg-indigo-900 text-indigo-200' : 'bg-gray-700 text-gray-300'
          }`}>
            {item.name} - {item.value}
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-400">
        Selected: {selectedRows.length} items
      </div>
    </div>
  );
}

// Chat Component - corresponds to Component B in user's description
export function SimpleChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    // Listen to event execution results
    const events = ["context.filter", "table.selectAll"];
    
    const unsubscribes = events.map(event => {
      return ui.on(event, (props, next) => {
        const { message } = props;
        if (message) {
          addMessage(message);
        }
        next();
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, []);

  const handleFilter = () => {
    // Implementation of handleFilter
  };

  const handleSelectAll = () => {
    // Implementation of handleSelectAll
  };

  const handleDeclareWorkflow = () => {
    // Implementation of handleDeclareWorkflow
  };

  const handleConsumeWorkflow = () => {
    // Implementation of handleConsumeWorkflow
  };

  return (
    <div className="p-4 border border-gray-600 rounded-lg bg-gray-800">
      <h3 className="font-semibold text-emerald-400 mb-3">💬 Component B (Chat)</h3>
      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="text-sm p-2 bg-gray-700 rounded text-gray-300">
            {message}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <button
          onClick={handleFilter}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔍 Apply Filter (Important items)
        </button>
        <button
          onClick={handleSelectAll}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          ✅ Select All Filtered Items
        </button>
        <button
          onClick={handleDeclareWorkflow}
          className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          📝 Declare "Filter + Select" Workflow
        </button>
        {ui.hasChain("filter-and-select") && (
          <button
            onClick={handleConsumeWorkflow}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            🚀 Consume "Filter + Select" Workflow
          </button>
        )}
      </div>
    </div>
  );
}

export default function SimpleStateExample() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-800 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-white">
        ✨ Declarative AI Workflow Architecture Demonstration
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <SimpleChatComponent />
        </div>
        <div>
          <SimpleTableComponent />
        </div>
      </div>

      <div className="bg-indigo-900 border border-indigo-700 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-200 mb-4">💡 How the Declarative Architecture Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-900 p-4 rounded">
            <h4 className="font-medium text-blue-200 mb-2">1️⃣ Declare First</h4>
            <p className="text-blue-100 text-sm">AI uses ui.chain() to build workflow definitions without executing them.</p>
          </div>
          <div className="bg-purple-900 p-4 rounded">
            <h4 className="font-medium text-purple-200 mb-2">2️⃣ Control Timing</h4>
            <p className="text-purple-100 text-sm">Add sleep() for async operations and timing control in the workflow chain.</p>
          </div>
          <div className="bg-green-900 p-4 rounded">
            <h4 className="font-medium text-green-200 mb-2">3️⃣ Execute When Ready</h4>
            <p className="text-green-100 text-sm">Use ui.consume() to execute at the perfect moment when all conditions are met.</p>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-800 p-4 rounded">
          <h4 className="font-medium text-indigo-200 mb-2">🚀 Key Benefits</h4>
          <ul className="text-indigo-100 text-sm space-y-1 list-disc list-inside">
            <li>Eliminates timing conflicts in async UI operations</li>
            <li>AI can build complex workflows step by step</li>
            <li>Perfect timing control with sleep() and conditional execution</li>
            <li>One-time consumption prevents duplicate execution</li>
            <li>Naturally solves the original state synchronization problem</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 