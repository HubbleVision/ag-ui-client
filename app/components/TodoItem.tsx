"use client";

import { useState, useEffect, useRef } from "react";
import { ui } from "../../lib/event-bridge/instance";

interface TodoItemProps {
  id: string;
  title: string;
  completed: boolean;
  isLatest?: boolean;
}

export default function TodoItem({ id, title, completed: initialCompleted, isLatest = false }: TodoItemProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only handle workflow events if this component is the latest item or has a specific ID
    if (isLatest) {
      // workflow.markComplete - Mark the current task as completed
      const unsubMarkComplete = ui.on("workflow.markComplete", (props, next) => {
        const { targetId } = props;
        // Skip if target ID is specified and doesn't match current ID
        if (targetId && targetId !== id) {
          next();
          return;
        }
        
        setCompleted(true);
        ui.add("todo.toggle", { id, completed: true });
        next();
      });

      // workflow.editTask - Edit the current task
      const unsubEditTask = ui.on("workflow.editTask", (props, next) => {
        const { newTitle, targetId } = props;
        // Skip if target ID is specified and doesn't match current ID
        if (targetId && targetId !== id) {
          next();
          return;
        }
        
        if (newTitle) {
          setEditTitle(newTitle);
          setIsEditing(false);
          ui.add("todo.edit", { id, title: newTitle });
        }
        next();
      });

      return () => {
        unsubMarkComplete();
        unsubEditTask();
      };
    }
    
    return undefined;
  }, [id, isLatest]);

  // Listen to todo.toggle events to update local state
  useEffect(() => {
    const unsubToggle = ui.on("todo.toggle", (props, next) => {
      const { id: toggleId, completed: newCompleted } = props;
      if (toggleId === id) {
        setCompleted(newCompleted);
      }
      next();
    });

    // Listen to todo.edit events to update local state
    const unsubEdit = ui.on("todo.edit", (props, next) => {
      const { id: editId, title: newTitle } = props;
      if (editId === id && newTitle) {
        setEditTitle(newTitle);
      }
      next();
    });

    return () => {
      unsubToggle();
      unsubEdit();
    };
  }, [id]);

  const handleToggle = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    ui.add("todo.toggle", { id, completed: newCompleted });
  };

  const handleDelete = () => {
    ui.add("todo.delete", { id });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (editTitle.trim() !== title) {
      ui.add("todo.edit", { id, title: editTitle });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(title);
  };

  return (
    <div 
      id={id}
      ref={itemRef}
      className={`flex items-center border-b border-slate-200 py-4 px-4 transition-all ${isLatest ? 'bg-blue-50' : ''}`}
      data-testid={`todo-item-${id}`}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        className="h-5 w-5 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      
      {isEditing ? (
        <div className="ml-4 flex-1 flex items-center">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="ml-3 px-3 py-2 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="ml-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-md text-sm hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <span 
            className={`ml-4 flex-1 text-slate-700 ${completed ? 'line-through text-slate-400' : ''}`}
            onDoubleClick={handleEdit}
          >
            {title}
          </span>
          <div className="flex items-center">
            <button
              onClick={handleEdit}
              className="ml-2 px-3 py-1 text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="ml-2 px-3 py-1 text-rose-500 hover:text-rose-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
} 