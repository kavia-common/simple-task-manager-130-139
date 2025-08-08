import React, { useState, useEffect, useRef } from "react";
import "./App.css";

/**
 * Color palette from the requirements.
 *
 *  --primary:   #1976d2
 *  --secondary: #424242
 *  --accent:    #ffb300
 *  --bg:        #fff
 */

// Util: Generate unique IDs for todos
function uuid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 6)
  );
}

// PUBLIC_INTERFACE
function TodoApp() {
  // READ todos from localStorage on mount
  const [todos, setTodos] = useState(() => {
    try {
      const stored = localStorage.getItem("todos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Maintain input form state
  const [inputTitle, setInputTitle] = useState("");
  const [inputDetail, setInputDetail] = useState("");
  const [editId, setEditId] = useState(null); // id to edit
  const [filter, setFilter] = useState("all"); // all | completed

  // Focus management for accessibility
  const inputRef = useRef(null);
  useEffect(() => {
    if (editId !== null) {
      inputRef.current && inputRef.current.focus();
    }
  }, [editId]);

  // Whenever todos changes, persist to localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Derived state: filtered todos
  const shownTodos =
    filter === "all"
      ? todos
      : todos.filter((t) => t.completed);

  // HANDLERS

  // Add or Update todo handler
  function handleSubmit(e) {
    e.preventDefault();
    const title = inputTitle.trim();
    const detail = inputDetail.trim();
    if (!title) return;

    if (editId) {
      setTodos((tds) =>
        tds.map((t) =>
          t.id === editId
            ? { ...t, title, detail }
            : t
        )
      );
      setEditId(null);
    } else {
      setTodos((tds) => [
        {
          id: uuid(),
          title,
          detail,
          completed: false,
          created_at: Date.now()
        },
        ...tds
      ]);
    }
    setInputTitle("");
    setInputDetail("");
  }

  // Start editing
  function startEdit(todo) {
    setEditId(todo.id);
    setInputTitle(todo.title);
    setInputDetail(todo.detail);
    inputRef.current && inputRef.current.focus();
  }

  // Cancel editing
  function cancelEdit() {
    setEditId(null);
    setInputTitle("");
    setInputDetail("");
  }

  // Delete
  function handleDelete(id) {
    setTodos((tds) => tds.filter((t) => t.id !== id));
    if (editId === id) cancelEdit();
  }

  // Mark complete
  function toggleComplete(id) {
    setTodos((tds) =>
      tds.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed }
          : t
      )
    );
  }

  // Keyboard Accessibility for submit on Enter
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
  }

  // RENDER

  return (
    <div className="todo-app-outer">
      <AppHeader />
      <section className="todo-main">
        <form className="todo-form" onSubmit={handleSubmit} autoComplete="off">
          <input
            className="todo-title-input"
            ref={inputRef}
            value={inputTitle}
            placeholder="Title"
            maxLength={40}
            onChange={(e) => setInputTitle(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Todo Title"
          />
          <input
            className="todo-detail-input"
            value={inputDetail}
            placeholder="Detail (optional)"
            maxLength={60}
            onChange={(e) => setInputDetail(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Todo Detail"
          />
          <button className="btn-accent todo-add-btn" type="submit">
            {editId ? "Update" : "Add"}
          </button>
          {editId && (
            <button
              className="btn-secondary todo-cancel-btn"
              type="button"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </form>
        <TodoToolbar filter={filter} setFilter={setFilter} />
        <TodoList
          todos={shownTodos}
          onEdit={startEdit}
          onDelete={handleDelete}
          onToggle={toggleComplete}
        />
      </section>
      <div className="todo-attribution">
        <small>
          Minimal Todo | Powered by React | <a href="https://kavia.ai/" target="_blank" rel="noreferrer">kavia.ai</a>
        </small>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function AppHeader() {
  return (
    <header className="todo-header">
      <div className="todo-icon">
        <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-label="app icon">
          <circle cx="16" cy="16" r="16" fill="#1976d2" />
          <path d="M9 16.5L14 21.5L23 12.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="todo-title">TODO APP</h1>
    </header>
  );
}

// PUBLIC_INTERFACE
function TodoToolbar({ filter, setFilter }) {
  return (
    <nav className="todo-toolbar" aria-label="Todo filters">
      <button
        className={`toolbar-btn ${filter === "all" ? "active" : ""}`}
        style={{ "--toolbarColor": "var(--primary)" }}
        onClick={() => setFilter("all")}
        aria-pressed={filter === "all"}
      >
        All
      </button>
      <button
        className={`toolbar-btn ${filter === "completed" ? "active" : ""}`}
        style={{ "--toolbarColor": "var(--accent)" }}
        onClick={() => setFilter("completed")}
        aria-pressed={filter === "completed"}
      >
        Completed
      </button>
    </nav>
  );
}

// PUBLIC_INTERFACE
function TodoList({ todos, onEdit, onDelete, onToggle }) {
  if (todos.length === 0)
    return (
      <div className="todo-list-empty">
        <em>No tasks found.</em>
      </div>
    );

  return (
    <ul className="todo-list" aria-label="Todo list">
      {todos.map((todo) => (
        <li
          className={`todo-item ${todo.completed ? "done" : ""}`}
          key={todo.id}
        >
          <div className="todo-main-row">
            <button
              className={`todo-toggle-btn${todo.completed ? " checked" : ""}`}
              onClick={() => onToggle(todo.id)}
              title="Mark complete"
              aria-label={todo.completed ? "Mark as not completed" : "Mark as completed"}
              tabIndex={0}
            >
              {todo.completed ? (
                // Checked icon
                <svg width="20" height="20" aria-label="checked">
                  <circle cx="10" cy="10" r="10" fill="#ffb300"/>
                  <path d="M6 10.5L9 13.5L15 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                // Unchecked icon
                <svg width="20" height="20" aria-label="unchecked">
                  <circle cx="10" cy="10" r="10" fill="none" stroke="#bdbdbd" strokeWidth="2"/>
                </svg>
              )}
            </button>
            <div className="todo-item-content">
              <span className="todo-item-title">{todo.title}</span>
              {todo.detail && (
                <span className="todo-item-detail">{todo.detail}</span>
              )}
            </div>
            <div className="todo-item-actions">
              <button
                className="todo-edit-btn"
                aria-label="Edit"
                title="Edit"
                onClick={() => onEdit(todo)}
              >
                <svg width="18" height="18" fill="none" aria-label="edit icon"><rect x="2" y="13" width="14" height="3" fill="#424242"/><rect x="5" y="7" width="11" height="3" fill="#1976d2"/><rect x="11" y="2" width="3" height="11" fill="#ffb300"/></svg>
              </button>
              <button
                className="todo-del-btn"
                aria-label="Delete"
                title="Delete"
                onClick={() => onDelete(todo.id)}
              >
                <svg width="18" height="18" aria-label="delete icon" fill="none" viewBox="0 0 18 18"><rect x="3" y="7" width="12" height="7" rx="2" fill="#e53935"/><rect x="0" y="3" width="18" height="3" fill="#ffb300"/><rect x="6" y="10" width="1.5" height="3" fill="#fff"/><rect x="10.5" y="10" width="1.5" height="3" fill="#fff"/></svg>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TodoApp;
