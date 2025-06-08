"use client";

import { useState, useEffect } from "react";
import TodoItem from "./TodoItem";
import { ui } from "../../lib/event-bridge/instance";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  initialTodos?: Todo[];
}

export default function TodoList({ initialTodos = [] }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [latestTodoId, setLatestTodoId] = useState<string | null>(null);

  useEffect(() => {
    // Listen to todo.add events
    const unsubAddTodo = ui.on("todo.add", (props, next) => {
      const { title } = props;
      const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        completed: false,
      };
      setTodos((prev) => [...prev, newTodo]);
      setLatestTodoId(newTodo.id);
      next({ todo: newTodo });
    });

    // Listen to todo.toggle events
    const unsubToggleTodo = ui.on("todo.toggle", (props, next) => {
      const { id, completed } = props;
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );
      next({ id, completed });
    });

    // Listen to todo.delete events
    const unsubDeleteTodo = ui.on("todo.delete", (props, next) => {
      const { id } = props;
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      if (latestTodoId === id) {
        setLatestTodoId(null);
      }
      next({ id });
    });

    // Listen to todo.edit events
    const unsubEditTodo = ui.on("todo.edit", (props, next) => {
      const { id, title } = props;
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, title } : todo
        )
      );
      next({ id, title });
    });

    // Listen to todo.clearCompleted events
    const unsubClearCompleted = ui.on("todo.clearCompleted", (props, next) => {
      setTodos((prev) => {
        const remainingTodos = prev.filter((todo) => !todo.completed);
        // Reset latestTodoId if the latest todo is cleared
        if (latestTodoId && !remainingTodos.some(todo => todo.id === latestTodoId)) {
          setLatestTodoId(null);
        }
        return remainingTodos;
      });
      next();
    });

    // Listen to workflow.deleteLatest events
    const unsubDeleteLatest = ui.on("workflow.deleteLatest", (props, next) => {
      if (latestTodoId) {
        // Use new declarative API
        ui.chain("delete-latest-todo")
          .add("todo.delete", { id: latestTodoId })
          .build();
        
        // Consume immediately
        ui.consume("delete-latest-todo");
      }
      next();
    });

    // Listen to workflow.markMultiple events for batch completion
    const unsubMarkMultiple = ui.on("workflow.markMultiple", (props, next) => {
      const { indexes = [] } = props;
      
      if (todos.length > 0) {
        // Declaratively define batch marking workflow
        const chain = ui.chain("mark-multiple-todos");
        
        // Find corresponding todos and add to chain
        indexes.forEach((index: number) => {
          if (index >= 0 && index < todos.length) {
            const todo = todos[index];
            chain.add("todo.toggle", { id: todo.id, completed: true });
          }
        });
        
        chain.build();
        
        // Consume immediately
        ui.consume("mark-multiple-todos");
      }
      
      next();
    });

    // Listen to workflow.markComplete events
    const unsubMarkComplete = ui.on("workflow.markComplete", (props, next) => {
      if (latestTodoId) {
        // Use new declarative API
        ui.chain("mark-latest-complete")
          .add("todo.toggle", { id: latestTodoId, completed: true })
          .build();
        
        // Consume immediately
        ui.consume("mark-latest-complete");
      }
      next();
    });
    
    // Listen to workflow.editTask events
    const unsubEditTask = ui.on("workflow.editTask", (props, next) => {
      const { newTitle } = props;
      if (latestTodoId && newTitle) {
        // Use new declarative API
        ui.chain("edit-latest-task")
          .add("todo.edit", { id: latestTodoId, title: newTitle })
          .build();
        
        // Consume immediately
        ui.consume("edit-latest-task");
      }
      next();
    });

    // Clean up event listeners on unmount
    return () => {
      unsubAddTodo();
      unsubToggleTodo();
      unsubDeleteTodo();
      unsubEditTodo();
      unsubClearCompleted();
      unsubDeleteLatest();
      unsubMarkMultiple();
      unsubMarkComplete();
      unsubEditTask();
    };
  }, [todos, latestTodoId]);

  // Timer to clear the latest item marker
  useEffect(() => {
    if (latestTodoId) {
      const timer = setTimeout(() => {
        setLatestTodoId(null);
      }, 5000); // Clear "latest" marker after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [latestTodoId]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      // Use new declarative API
      ui.chain("add-new-todo")
        .add("todo.add", { title: newTodo.trim() })
        .build();
      
      // Consume immediately
      ui.consume("add-new-todo");
      setNewTodo("");
    }
  };

  const handleClearCompleted = () => {
    // Use new declarative API
    ui.chain("clear-completed-todos")
      .add("todo.clearCompleted")
      .build();
    
    // Consume immediately
    ui.consume("clear-completed-todos");
  };

  const activeTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleAddTodo} className="mb-6 flex">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white bg-gray-700 placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="border border-gray-600 rounded-lg overflow-hidden shadow-sm">
        {todos.length === 0 ? (
          <div className="py-8 text-center text-gray-400 bg-gray-800">No tasks yet</div>
        ) : (
          <div className="divide-y divide-gray-600">
            {todos.map((todo) => (
              <TodoItem 
                key={todo.id} 
                {...todo} 
                isLatest={todo.id === latestTodoId}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-5 px-1 text-sm text-gray-400">
        <div>
          {activeTodos.length} {activeTodos.length === 1 ? 'task' : 'tasks'} remaining
        </div>
        {completedTodos.length > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
} 