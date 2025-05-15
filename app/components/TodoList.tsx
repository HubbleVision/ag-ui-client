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
        ui.add("todo.delete", { id: latestTodoId });
      }
      next();
    });

    // Listen to workflow.markMultiple events for batch completion
    const unsubMarkMultiple = ui.on("workflow.markMultiple", (props, next) => {
      const { indexes = [] } = props;
      
      if (todos.length > 0) {
        // Find and mark todos by index
        indexes.forEach((index: number) => {
          if (index >= 0 && index < todos.length) {
            const todo = todos[index];
            ui.add("todo.toggle", { id: todo.id, completed: true });
          }
        });
      }
      
      next();
    });

    // Listen to workflow.markComplete events
    const unsubMarkComplete = ui.on("workflow.markComplete", (props, next) => {
      if (latestTodoId) {
        ui.add("todo.toggle", { id: latestTodoId, completed: true });
      }
      next();
    });
    
    // Listen to workflow.editTask events
    const unsubEditTask = ui.on("workflow.editTask", (props, next) => {
      const { newTitle } = props;
      if (latestTodoId && newTitle) {
        ui.add("todo.edit", { id: latestTodoId, title: newTitle });
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
      ui.add("todo.add", { title: newTodo.trim() });
      setNewTodo("");
    }
  };

  const handleClearCompleted = () => {
    ui.add("todo.clearCompleted");
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
          className="flex-1 px-4 py-3 border border-slate-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Add
        </button>
      </form>

      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {todos.length === 0 ? (
          <div className="py-8 text-center text-slate-500 bg-slate-50">No tasks yet</div>
        ) : (
          <div className="divide-y divide-slate-200">
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

      <div className="flex justify-between items-center mt-5 px-1 text-sm text-slate-500">
        <div>
          {activeTodos.length} {activeTodos.length === 1 ? 'task' : 'tasks'} remaining
        </div>
        {completedTodos.length > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
} 