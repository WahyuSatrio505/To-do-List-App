// Global Variables
const currentUser = null;
let todos = [];
const currentFilter = "all";
const currentTodoId = null;
let newTodoInput = null; // Declare newTodoInput variable

// API Base URL - sesuaikan dengan server kamu
const API_BASE = "http://localhost/todoapp/api";

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App starting with database...");

  try {
    initializeElements();
    initializeApp();
    setupEventListeners();
    console.log("✅ App initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing app:", error);
    alert("Terjadi kesalahan saat memuat aplikasi. Silakan refresh halaman.");
  }
});

// Auth Functions with API calls
async function handleLogin(e) {
  e.preventDefault();
  console.log("🔐 Attempting login with database...");

  try {
    const email = document.getElementById("loginEmail")?.value;
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
      alert("Mohon isi email dan password!");
      return;
    }

    const btn = e.target.querySelector(".auth-btn");
    const btnText = btn?.querySelector(".btn-text");
    const spinner = btn?.querySelector(".loading-spinner");

    // Show loading
    if (btn) btn.disabled = true;
    if (btnText) btnText.style.display = "none";
    if (spinner) spinner.style.display = "block";

    // API call to login
    const response = await fetch(`${API_BASE}/auth.php?action=login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Login successful:", result.user.username);
      showSuccessAndLogin(result.user);
    } else {
      console.log("❌ Login failed:", result.message);
      alert(result.message);

      // Reset button
      if (btn) btn.disabled = false;
      if (btnText) btnText.style.display = "block";
      if (spinner) spinner.style.display = "none";
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    alert("Terjadi kesalahan saat login. Silakan coba lagi.");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  console.log("📝 Attempting registration with database...");

  try {
    const username = document.getElementById("registerUsername")?.value;
    const email = document.getElementById("registerEmail")?.value;
    const password = document.getElementById("registerPassword")?.value;

    if (!username || !email || !password) {
      alert("Mohon isi semua field!");
      return;
    }

    const btn = e.target.querySelector(".auth-btn");
    const btnText = btn?.querySelector(".btn-text");
    const spinner = btn?.querySelector(".loading-spinner");

    // Show loading
    if (btn) btn.disabled = true;
    if (btnText) btnText.style.display = "none";
    if (spinner) spinner.style.display = "block";

    // API call to register
    const response = await fetch(`${API_BASE}/auth.php?action=register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Registration successful:", result.user.username);
      showSuccessAndLogin(result.user);
    } else {
      console.log("❌ Registration failed:", result.message);
      alert(result.message);

      // Reset button
      if (btn) btn.disabled = false;
      if (btnText) btnText.style.display = "block";
      if (spinner) spinner.style.display = "none";
    }
  } catch (error) {
    console.error("❌ Registration error:", error);
    alert("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
  }
}

// Todo Functions with API calls
async function loadUserTodos() {
  if (!currentUser) return;

  console.log("📋 Loading todos from database for user:", currentUser.username);

  try {
    const response = await fetch(`${API_BASE}/todos.php?user_id=${currentUser.id}`);
    const result = await response.json();

    if (result.success) {
      todos = result.todos.map((todo) => ({
        id: todo.id.toString(),
        userId: todo.user_id.toString(),
        text: todo.text,
        completed: todo.completed === "1" || todo.completed === 1,
        createdAt: todo.created_at,
        priority: todo.priority,
      }));

      console.log(`✅ Loaded ${todos.length} todos from database`);
      updateStats(); // Declare updateStats function
      renderTodos(); // Declare renderTodos function
    } else {
      console.error("❌ Error loading todos:", result.message);
      todos = [];
    }
  } catch (error) {
    console.error("❌ Error loading todos:", error);
    todos = [];
  }
}

async function addTodo() {
  if (!newTodoInput || !currentUser) return;

  const text = newTodoInput.value.trim();
  if (!text) return;

  console.log("➕ Adding new todo to database:", text);

  try {
    const response = await fetch(`${API_BASE}/todos.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        text: text,
        priority: "medium",
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Todo added to database");
      newTodoInput.value = "";
      await loadUserTodos(); // Reload todos from database
    } else {
      console.error("❌ Error adding todo:", result.message);
      alert("Gagal menambahkan todo: " + result.message);
    }
  } catch (error) {
    console.error("❌ Error adding todo:", error);
    alert("Terjadi kesalahan saat menambahkan todo");
  }
}

async function toggleTodo(id) {
  console.log("🔄 Toggling todo in database:", id);

  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  try {
    const response = await fetch(`${API_BASE}/todos.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        completed: !todo.completed,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Todo toggled in database");
      await loadUserTodos(); // Reload todos from database
    } else {
      console.error("❌ Error toggling todo:", result.message);
    }
  } catch (error) {
    console.error("❌ Error toggling todo:", error);
  }
}

async function deleteTodo(id) {
  console.log("🗑️ Deleting todo from database:", id);

  const todoElement = document.querySelector(`[data-id="${id}"]`);
  if (todoElement) {
    todoElement.classList.add("deleting");

    try {
      const response = await fetch(`${API_BASE}/todos.php?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Todo deleted from database");
        setTimeout(async () => {
          await loadUserTodos(); // Reload todos from database
        }, 300);
      } else {
        console.error("❌ Error deleting todo:", result.message);
        todoElement.classList.remove("deleting");
      }
    } catch (error) {
      console.error("❌ Error deleting todo:", error);
      todoElement.classList.remove("deleting");
    }
  }
}

async function updateTodoPriority(id, priority) {
  console.log("🏷️ Updating priority in database:", id, priority);

  try {
    const response = await fetch(`${API_BASE}/todos.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        priority: priority,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Priority updated in database");
      await loadUserTodos(); // Reload todos from database
    } else {
      console.error("❌ Error updating priority:", result.message);
    }
  } catch (error) {
    console.error("❌ Error updating priority:", error);
  }

  closePriorityModal(); // Declare closePriorityModal function
}

// Declare initializeElements function
function initializeElements() {
  newTodoInput = document.getElementById("newTodoInput");
}

// Declare initializeApp function
function initializeApp() {
  // Initialization logic here
}

// Declare setupEventListeners function
function setupEventListeners() {
  // Event listener setup logic here
}

// Declare showSuccessAndLogin function
function showSuccessAndLogin(user) {
  // Logic to show success message and login user here
}

// Declare updateStats function
function updateStats() {
  // Logic to update stats here
}

// Declare renderTodos function
function renderTodos() {
  // Logic to render todos here
}

// Declare closePriorityModal function
function closePriorityModal() {
  // Logic to close priority modal here
}
