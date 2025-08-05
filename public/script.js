const AUTH_URL = `/auth`;
const TASKS_URL = `/tasks`;

document.addEventListener("DOMContentLoaded", () => {
  // Contenedores
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");
  const feedbackDiv = document.getElementById("feedback");
  const appFeedbackDiv = document.getElementById("app-feedback");

  // Formularios y botones
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const inputBox = document.getElementById("input-box");
  const addBtn = document.getElementById("add-btn");
  const listContainer = document.getElementById("list-container");
  const charCount = document.getElementById("char-count");

  // Validación y saneamiento
  const utils = {
    maxLength: 50,
    regex: /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ .,;:!¿?()\-_/]/g,
    sanitize(text) {
      return text.trim().replace(this.regex, "");
    },
    isInvalidCharPresent(text) {
      return this.regex.test(text);
    },
  };

  // Feedback visual
  function showFeedback(msg, type = "error", forApp = false) {
    const el = forApp ? appFeedbackDiv : feedbackDiv;
    if (!el) return;
    el.textContent = msg;
    el.className = `feedback ${type}`;
    el.classList.remove("hidden");
    setTimeout(
      () => {
        el.classList.add("hidden");
      },
      type === "success" ? 1800 : 3000
    );
  }
  function clearFeedback(forApp = false) {
    const el = forApp ? appFeedbackDiv : feedbackDiv;
    if (el) (el.textContent = ""), (el.className = "feedback hidden");
  }

  // Mostrar/ocultar secciones
  function showAuth() {
    authContainer.style.display = "";
    appContainer.style.display = "none";
    clearFeedback();
    clearFeedback(true);
  }
  function showApp() {
    authContainer.style.display = "none";
    appContainer.style.display = "";
    clearFeedback();
    clearFeedback(true);
  }

  // Sesión
  let token = localStorage.getItem("token");
  if (token) {
    showApp();
    loadTasks();
  } else {
    showAuth();
  }

  // Manejo centralizado de errores 401
  function handleApiError(err) {
    if (err && err.error && err.error.toLowerCase().includes("token")) {
      localStorage.removeItem("token");
      token = null;
      showAuth();
      showFeedback(
        "Tu sesión ha expirado o es inválida. Por favor, vuelve a iniciar sesión.",
        "error"
      );
      return true;
    }
    return false;
  }

  // Registro
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFeedback();
    const username = registerForm["register-username"].value.trim();
    const password = registerForm["register-password"].value;
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw await res.json();
      showFeedback("¡Registro exitoso! Ahora inicia sesión.", "success");
      registerForm.reset();
    } catch (err) {
      if (!handleApiError(err)) {
        showFeedback(err.error || "Error en el registro", "error");
      }
    }
  });

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFeedback();
    const username = loginForm["login-username"].value.trim();
    const password = loginForm["login-password"].value;
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      token = data.token;
      localStorage.setItem("token", token);
      loginForm.reset();
      showApp();
      loadTasks();
    } catch (err) {
      if (!handleApiError(err)) {
        showFeedback(err.error || "Login fallido", "error");
      }
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    token = null;
    listContainer.innerHTML = "";
    showAuth();
  });

  // Cargar tareas
  async function loadTasks() {
    listContainer.innerHTML = "";
    clearFeedback(true);
    try {
      const res = await fetch(TASKS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw data;
      data.forEach((tarea) => renderTask(tarea));
      if (!data.length)
        showFeedback("No tienes tareas todavía. ¡Añade una!", "success", true);
    } catch (err) {
      if (!handleApiError(err)) {
        showFeedback("Error cargando tareas", "error", true);
        console.error("Error cargando tareas:", err);
      }
    }
  }

  // Renderiza una tarea
  function renderTask(task, existingLi) {
    const li = existingLi || document.createElement("li");
    li.className = task.checked ? "checked" : "";
    li.innerHTML = `
  <span class="check-icon">${task.checked ? "check_circle" : "radio_button_unchecked"
      }</span>
  <span class="task-text-wrap">
    <span class="task-text">${task.title}</span>
  </span>
  <span class="actions">
    <span class="edit-btn">edit</span>
    <span class="delete-btn">delete</span>
  </span>
`;

    const checkIcon = li.querySelector(".check-icon");
    const taskText = li.querySelector(".task-text");

    // Efecto Hover (no marcado)
    const setHover = () => {
      if (task.checked) return;
      checkIcon.textContent = "check_circle";
      checkIcon.classList.add("icon-hovered");
      li.classList.add("hovered");
    };
    const unsetHover = () => {
      if (task.checked) return;
      checkIcon.textContent = "radio_button_unchecked";
      checkIcon.classList.remove("icon-hovered");
      li.classList.remove("hovered");
    };

    checkIcon.addEventListener("mouseenter", setHover);
    checkIcon.addEventListener("mouseleave", unsetHover);
    taskText.addEventListener("mouseenter", setHover);
    taskText.addEventListener("mouseleave", unsetHover);

    // Marcar/desmarcar tarea
    const toggleComplete = async () => {
      clearFeedback(true);
      try {
        const res = await fetch(`${TASKS_URL}/${task.id}/complete`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ checked: !task.checked }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        showFeedback(
          task.checked ? "Tarea desmarcada" : "Tarea completada",
          "success",
          true
        );
        task.checked = !task.checked;
        li.className = task.checked ? "checked" : "";
        checkIcon.textContent = task.checked
          ? "check_circle"
          : "radio_button_unchecked";
        // Añade animación al marcar, y la quita tras el efecto
        if (task.checked) {
          checkIcon.classList.remove("icon-hovered");
          li.classList.remove("hovered");
          checkIcon.classList.add("check-pop-anim");
          setTimeout(() => {
            checkIcon.classList.remove("check-pop-anim");
          }, 600);
        }
      } catch (err) {
        if (!handleApiError(err)) {
          showFeedback("Error actualizando tarea", "error", true);
          console.error("Error actualizando tarea:", err);
        }
      }
    };
    checkIcon.addEventListener("click", toggleComplete);
    taskText.addEventListener("click", toggleComplete);

    // Borrar tarea
    li.querySelector(".delete-btn").addEventListener("click", async () => {
      clearFeedback(true);
      try {
        const res = await fetch(`${TASKS_URL}/${task.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw data;
        showFeedback("Tarea eliminada", "success", true);
        li.remove();
      } catch (err) {
        if (!handleApiError(err)) {
          showFeedback("Error borrando tarea", "error", true);
          console.error("Error borrando tarea:", err);
        }
      }
    });

    // Editar tarea
    li.querySelector(".edit-btn").addEventListener("click", async () => {
      clearFeedback(true);
      const nuevo = prompt("Nuevo texto:", task.title);
      if (!nuevo) return;
      const limpio = utils.sanitize(nuevo);
      if (!limpio) {
        showFeedback(
          "El texto no puede estar vacío ni contener caracteres no permitidos.",
          "error",
          true
        );
        return;
      }
      try {
        const res = await fetch(`${TASKS_URL}/${task.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: limpio }),
        });
        const data = await res.json();
        if (!res.ok) throw data;
        showFeedback("Tarea editada", "success", true);
        renderTask({ ...task, title: limpio }, li);
      } catch (err) {
        if (!handleApiError(err)) {
          showFeedback("Error editando tarea", "error", true);
          console.error("Error editando tarea:", err);
        }
      }
    });

    if (!existingLi) listContainer.appendChild(li);
  }

  // Añadir nueva tarea
  addBtn.addEventListener("click", async () => {
    clearFeedback(true);
    const raw = inputBox.value;
    const title = utils.sanitize(raw);
    if (!title) {
      showFeedback("Introduce un texto válido para la tarea.", "error", true);
      return;
    }
    try {
      const res = await fetch(TASKS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      inputBox.value = "";
      showFeedback("Tarea añadida", "success", true);
      renderTask(data);
    } catch (err) {
      if (!handleApiError(err)) {
        showFeedback("Error añadiendo tarea", "error", true);
        console.error("Error añadiendo tarea:", err);
      }
    }
  });

  // Añadir con ENTER
  inputBox.addEventListener("keyup", (e) => {
    if (e.key === "Enter") addBtn.click();
  });

  // Validación de input
  inputBox.addEventListener("input", () => {
    const text = inputBox.value;
    const count = text.length;
    if (utils.isInvalidCharPresent(text)) {
      inputBox.style.borderColor = "red";
    } else {
      inputBox.style.borderColor = "";
    }
    if (count >= 45 && count <= utils.maxLength) {
      charCount.classList.add("visible");
      charCount.textContent = `${count}/${utils.maxLength}`;
    } else {
      charCount.classList.remove("visible");
    }
  });
});
