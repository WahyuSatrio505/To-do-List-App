// Global Variables
let currentUser = null;
let todos = [];
let currentFilter = "all";
let currentTodoId = null;

// DOM Elements
const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");
const themeToggle = document.getElementById("themeToggle");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const successMessage = document.getElementById("successMessage");
const welcomeMessage = document.getElementById("welcomeMessage");
const logoutBtn = document.getElementById("logoutBtn");
const newTodoInput = document.getElementById("newTodoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const priorityModal = document.getElementById("priorityModal");

// Stats Elements
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");
const progressFill = document.getElementById("progressFill");
const progressPercentage = document.getElementById("progressPercentage");
const progressText = document.getElementById("progressText");

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  // Check for saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  // Check for logged in user
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard();
    loadUserTodos();
  } else {
    showAuth();
  }
}

function setupEventListeners() {
  // Theme Toggle
  themeToggle.addEventListener("click", toggleTheme);

  // Auth Tabs
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      switchAuthTab(this.dataset.tab);
    });
  });

  // Auth Forms
  loginForm.addEventListener("submit", handleLogin);
  registerForm.addEventListener("submit", handleRegister);

  // Dashboard
  logoutBtn.addEventListener("click", handleLogout);
  addTodoBtn.addEventListener("click", addTodo);
  newTodoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  });

  // Filter Tabs
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      setFilter(this.dataset.filter);
    });
  });

  // Priority Modal
  document.querySelector(".modal-close").addEventListener("click", closePriorityModal);
  document.querySelectorAll(".priority-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      updateTodoPriority(currentTodoId, this.dataset.priority);
    });
  });

  // Close modal on outside click
  priorityModal.addEventListener("click", (e) => {
    if (e.target === priorityModal) {
      closePriorityModal();
    }
  });
}

// Theme Functions
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector("i");
  icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// Auth Functions
function switchAuthTab(tab) {
  // Update tabs
  document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
  document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

  // Update forms
  document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("active"));
  document.getElementById(`${tab}Form`).classList.add("active");
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const btn = e.target.querySelector(".auth-btn");
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".loading-spinner");

  // Show loading
  btn.disabled = true;
  btnText.style.display = "none";
  spinner.style.display = "block";

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if user exists
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email);

  if (user) {
    showSuccessAndLogin(user);
  } else {
    alert("User tidak ditemukan! Silakan register terlebih dahulu.");
    // Reset button
    btn.disabled = false;
    btnText.style.display = "block";
    spinner.style.display = "none";
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const btn = e.target.querySelector(".auth-btn");
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".loading-spinner");

  // Show loading
  btn.disabled = true;
  btnText.style.display = "none";
  spinner.style.display = "block";

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if user already exists
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    alert("Email sudah terdaftar! Silakan login.");
    // Reset button
    btn.disabled = false;
    btnText.style.display = "block";
    spinner.style.display = "none";
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    username: username,
    email: email,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showSuccessAndLogin(newUser);
}

function showSuccessAndLogin(user) {
  // Hide forms and show success
  document.querySelectorAll(".auth-form").forEach((f) => (f.style.display = "none"));
  document.querySelector(".auth-tabs").style.display = "none";
  successMessage.style.display = "block";

  // Login after delay
  setTimeout(() => {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    showDashboard();
    loadUserTodos();
  }, 1500);
}

function handleLogout() {
  currentUser = null;
  todos = [];
  localStorage.removeItem("currentUser");
  showAuth();
  resetAuthForms();
}

function resetAuthForms() {
  // Reset forms
  loginForm.reset();
  registerForm.reset();

  // Reset UI
  document.querySelectorAll(".auth-form").forEach((f) => {
    f.style.display = "none";
    f.classList.remove("active");
  });

  loginForm.style.display = "block";
  loginForm.classList.add("active");

  document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
  document.querySelector('[data-tab="login"]').classList.add("active");

  document.querySelector(".auth-tabs").style.display = "flex";
  successMessage.style.display = "none";

  // Reset buttons
  document.querySelectorAll(".auth-btn").forEach((btn) => {
    btn.disabled = false;
    btn.querySelector(".btn-text").style.display = "block";
    btn.querySelector(".loading-spinner").style.display = "none";
  });
}

// Navigation Functions
function showAuth() {
  authSection.style.display = "flex";
  dashboardSection.style.display = "none";
}

function showDashboard() {
  authSection.style.display = "none";
  dashboardSection.style.display = "block";
  welcomeMessage.textContent = `Halo, ${currentUser.username}! 👋`;
}

// Todo Functions
function loadUserTodos() {
  const allTodos = JSON.parse(localStorage.getItem("todos") || "[]");
  todos = allTodos.filter((todo) => todo.userId === currentUser.id);
  updateStats();
  renderTodos();
}

function saveTodos() {
  const allTodos = JSON.parse(localStorage.getItem("todos") || "[]");
  const otherUsersTodos = allTodos.filter((todo) => todo.userId !== currentUser.id);
  const newAllTodos = [...otherUsersTodos, ...todos];
  localStorage.setItem("todos", JSON.stringify(newAllTodos));
}

function addTodo() {
  const text = newTodoInput.value.trim();
  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    userId: currentUser.id,
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
    priority: "medium",
  };

  todos.unshift(newTodo);
  saveTodos();
  newTodoInput.value = "";
  updateStats();
  renderTodos();

  // Add animation
  setTimeout(() => {
    const firstTodo = todoList.querySelector(".todo-item");
    if (firstTodo) {
      firstTodo.style.animation = "none";
      firstTodo.offsetHeight; // Trigger reflow
      firstTodo.style.animation = "slideInLeft 0.3s ease";
    }
  }, 10);
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    updateStats();
    renderTodos();
  }
}

function deleteTodo(id) {
  const todoElement = document.querySelector(`[data-id="${id}"]`);
  if (todoElement) {
    todoElement.classList.add("deleting");
    setTimeout(() => {
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      updateStats();
      renderTodos();
    }, 300);
  }
}

function openPriorityModal(id) {
  currentTodoId = id;
  priorityModal.style.display = "flex";
}

function closePriorityModal() {
  priorityModal.style.display = "none";
  currentTodoId = null;
}

function updateTodoPriority(id, priority) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.priority = priority;
    saveTodos();
    renderTodos();
  }
  closePriorityModal();
}

function setFilter(filter) {
  currentFilter = filter;

  // Update active tab
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add("active");

  renderTodos();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  totalTasks.textContent = total;
  completedTasks.textContent = completed;
  remainingTasks.textContent = remaining;
  progressFill.style.width = `${percentage}%`;
  progressPercentage.textContent = `${percentage}%`;
  progressText.textContent = `${completed} dari ${total} tugas selesai`;
}

function renderTodos() {
  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    todoList.style.display = "none";
    emptyState.style.display = "block";

    // Update empty state message
    const emptyTitle = document.getElementById("emptyTitle");
    const emptyMessage = document.getElementById("emptyMessage");

    switch (currentFilter) {
      case "active":
        emptyTitle.textContent = "Semua tugas sudah selesai! 🎉";
        emptyMessage.textContent = "Kamu hebat! Semua tugas aktif sudah diselesaikan.";
        break;
      case "completed":
        emptyTitle.textContent = "Belum ada tugas yang selesai";
        emptyMessage.textContent = "Mulai selesaikan tugas-tugas kamu!";
        break;
      default:
        emptyTitle.textContent = "Belum ada tugas";
        emptyMessage.textContent = "Tambah tugas pertama kamu!";
    }
  } else {
    todoList.style.display = "flex";
    emptyState.style.display = "none";

    todoList.innerHTML = filteredTodos
      .map(
        (todo, index) => `
            <div class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}" style="animation-delay: ${index * 50}ms">
                <div class="todo-checkbox ${todo.completed ? "checked" : ""}" onclick="toggleTodo('${todo.id}')">
                    ${todo.completed ? '<i class="fas fa-check"></i>' : ""}
                </div>
                <div class="todo-content">
                    <div class="todo-text ${todo.completed ? "completed" : ""}">${escapeHtml(todo.text)}</div>
                    <div class="todo-date">${formatDate(todo.createdAt)}</div>
                </div>
                <div class="priority-badge ${todo.priority}">
                    ${getPriorityText(todo.priority)}
                </div>
                <div class="todo-actions">
                    <button class="todo-btn priority-btn-todo" onclick="openPriorityModal('${todo.id}')" title="Ubah Prioritas">
                        <i class="fas fa-flag"></i>
                    </button>
                    <button class="todo-btn delete-btn" onclick="deleteTodo('${todo.id}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return (
      "Hari ini, " +
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else if (diffDays === 2) {
    return (
      "Kemarin, " +
      date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } else {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function getPriorityText(priority) {
  switch (priority) {
    case "high":
      return "Tinggi";
    case "medium":
      return "Sedang";
    case "low":
      return "Rendah";
    default:
      return "Sedang";
  }
}

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Enter to add todo
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (newTodoInput === document.activeElement) {
      addTodo();
    }
  }

  // Escape to close modal
  if (e.key === "Escape") {
    if (priorityModal.style.display === "flex") {
      closePriorityModal();
    }
  }
});

// Auto-save on page unload
window.addEventListener("beforeunload", () => {
  if (todos.length > 0) {
    saveTodos();
  }
});

// Service Worker for offline support (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
