
(function () {
  // Nueva key y legacy keys
  const STORAGE_KEY = "user_noma";
  const LEGACY_KEYS = ["users_goloe", "comunired_users_v1"];
  const PROCESSING_TEXT = "Procesando...";

  // Rutas de redirección (ajusta si tu estructura difiere)
  const REDIRECTS = {
    admin: "../admin/DashboardsAdmin.html",  // desde frontend/public/login.html -> ../admin/Dashboard.html
  };

  // --- Helpers storage ---
  function loadUsers(key = STORAGE_KEY) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Error leyendo users:", e);
      return [];
    }
  }
  function saveUsers(users, key = STORAGE_KEY) {
    localStorage.setItem(key, JSON.stringify(users));
  }

  // --- Migración de keys antiguas (si existen) ---
  function migrateStorageKey(oldKeys = LEGACY_KEYS, newKey = STORAGE_KEY) {
    try {
      const rawNew = localStorage.getItem(newKey);
      if (rawNew) return;
      for (const oldKey of oldKeys) {
        const rawOld = localStorage.getItem(oldKey);
        if (rawOld) {
          localStorage.setItem(newKey, rawOld);
          console.info(`Migrado contenido de "${oldKey}" a "${newKey}"`);
          return;
        }
      }
    } catch (e) {
      console.error("Error migrando storage:", e);
    }
  }

  // --- Seed demo users if needed ---
  function seedDemoUsersIfNeeded(key = STORAGE_KEY) {
    const users = loadUsers(key);
    if (!users || users.length === 0) {
      const demo = [
        { name: "Admin", email: "admin", password: "admin1", role: "admin" },
        { name: "Cliente", email: "cliente", password: "cliente1", role: "client" }
      ];
      saveUsers(demo, key);
      console.info("Demo users creados bajo key:", key, demo);
    }
  }

  // --- Snackbar ---
  function showSnackbar(message, { type = "info", timeout = 2500 } = {}) {
    const sb = document.getElementById("snackbar");
    if (!sb) {
      if (type === "error") return alert(message);
      return console.log(message);
    }
    sb.textContent = message;
    sb.classList.remove("error", "show");
    if (type === "error") sb.classList.add("error");
    // reiniciar animación
    sb.offsetWidth;
    sb.classList.add("show");

    clearTimeout(sb._hideTimeout);
    sb._hideTimeout = setTimeout(() => {
      sb.classList.remove("show");
      if (type === "error") sb.classList.remove("error");
    }, timeout);
  }

  // --- Button loading state ---
  function setButtonLoading(button, isLoading, opts = {}) {
    if (!button) return;
    const btnText = button.querySelector(".btn-text");
    const btnLoading = button.querySelector(".btn-loading");
    if (isLoading) {
      button.setAttribute("disabled", "disabled");
      if (!button._origText && btnText) button._origText = btnText.textContent;
      if (btnText) btnText.textContent = opts.text || PROCESSING_TEXT;
      if (btnLoading && !btnLoading.querySelector(".spinner")) {
        const spinner = document.createElement("span");
        spinner.className = "spinner";
        spinner.setAttribute("aria-hidden", "true");
        btnLoading.appendChild(spinner);
      }
      button.classList.add("loading");
    } else {
      button.removeAttribute("disabled");
      if (btnText) btnText.textContent = (button._origText) ? button._origText : (opts.restoreText || btnText.textContent);
      if (btnLoading) btnLoading.innerHTML = "";
      button.classList.remove("loading");
    }
  }

  // --- Small validators ---
  function isValidEmailOrUsername(email) {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    if (normalized === "admin" || normalized === "cliente") return true;
    return /\S+@\S+\.\S+/.test(normalized);
  }

  // Ejecutar migración y seed
  migrateStorageKey();
  seedDemoUsersIfNeeded();

  // --- Register logic ---
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameEl = document.getElementById("r-name");
      const emailEl = document.getElementById("r-email");
      const passEl = document.getElementById("r-password");
      const btn = document.getElementById("registerBtn");

      const name = nameEl ? nameEl.value.trim() : "";
      const email = emailEl ? emailEl.value.trim().toLowerCase() : "";
      const password = passEl ? passEl.value : "";

      if (!name || !email || !password) {
        showSnackbar("Completa todos los campos.", { type: "error" });
        return;
      }
      if (!isValidEmailOrUsername(email)) {
        showSnackbar("Ingresa un email o nombre de usuario válido.", { type: "error" });
        return;
      }

      setButtonLoading(btn, true);
      setTimeout(() => {
        const users = loadUsers();
        if (users.find(u => u.email === email)) {
          setButtonLoading(btn, false);
          showSnackbar("El email/usuario ya está registrado.", { type: "error" });
          return;
        }

        users.push({ name, email, password, role: "client" });
        saveUsers(users);
        setButtonLoading(btn, false);
        registerForm.reset();
        showSnackbar("Registro exitoso. Ya puedes iniciar sesión.", { type: "success" });
      }, 900);
    });
  }

  // --- Public login logic (con redirección por rol) ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailEl = document.getElementById("email");
      const passEl = document.getElementById("password");
      const btn = document.getElementById("submitBtn");

      const email = emailEl ? emailEl.value.trim().toLowerCase() : "";
      const password = passEl ? passEl.value : "";

      if (!email || !password) {
        showSnackbar("Completa ambos campos.", { type: "error" });
        return;
      }
      if (!isValidEmailOrUsername(email)) {
        showSnackbar("Email o usuario inválido.", { type: "error" });
        return;
      }

      setButtonLoading(btn, true);
      setTimeout(() => {
        const users = loadUsers();
        const user = users.find(u => u.email === email && u.password === password);
        setButtonLoading(btn, false);
        if (!user) {
          showSnackbar("Email/usuario o contraseña incorrectos.", { type: "error" });
          return;
        }

        showSnackbar(`Bienvenido, ${user.name || "usuario"}!`, { type: "success" });

        // Redirección según rol (se espera que las rutas definidas en REDIRECTS sean correctas)
        setTimeout(() => {
          if (user.role === "admin") {
            window.location.href = REDIRECTS.admin;
          } else {
            window.location.href = REDIRECTS.client;
          }
        }, 700); // dejar tiempo para que el usuario vea el snackbar
      }, 900);
    });
  }

  // --- Optional admin login (si existe adminLoginForm) ---
  const adminLoginForm = document.getElementById("adminLoginForm");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const userEl = document.getElementById("adminUser");
      const passEl = document.getElementById("adminPassword");
      const btn = document.getElementById("adminSubmitBtn");

      const user = userEl ? userEl.value.trim().toLowerCase() : "";
      const password = passEl ? passEl.value : "";

      if (!user || !password) {
        showSnackbar("Completa ambos campos (admin).", { type: "error" });
        return;
      }

      setButtonLoading(btn, true);
      setTimeout(() => {
        setButtonLoading(btn, false);
        const users = loadUsers();
        const found = users.find(u => (u.email === user || (u.name && u.name.toLowerCase() === user)) && u.password === password && u.role === "admin");
        if (found || (user === "admin" && password === "admin1")) {
          showSnackbar("Bienvenido, Admin!", { type: "success" });
          // adminLoginForm suele estar en admin/login.html, por eso redirigimos a DashboardsAdmin.html (misma carpeta)
          setTimeout(() => {
            window.location.href = "DashboardsAdmin.html";
          }, 600);
        } else {
          showSnackbar("Credenciales de admin incorrectas.", { type: "error" });
        }
      }, 800);
    });
  }

  // --- small accessibility: Esc para cerrar snackbar ---
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      const sb = document.getElementById("snackbar");
      if (sb) sb.classList.remove("show");
    }
  });

})();