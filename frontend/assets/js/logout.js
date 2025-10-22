// logout.js — limpia sesión en cliente y redirige al login
(function () {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  // Ajusta esta ruta si tu login está en otra ubicación
  const loginPathCandidates = [
    '../public/login.html',
    '../auth/login.html',
    '/login.html',
    'login.html'
  ];

  function clearSession() {
    const keys = ['token', 'authToken', 'user', 'session', 'currentUser', 'jwt', 'access_token'];
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
      try { sessionStorage.removeItem(k); } catch (e) {}
    });
    // No puede borrar cookies HttpOnly desde JS.
  }

  function redirectToLogin() {
    const target = loginPathCandidates[0];
    window.location.href = target;
  }

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const ok = confirm('¿Deseas cerrar sesión?');
    if (!ok) return;

    clearSession();

    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Saliendo...';
    setTimeout(() => redirectToLogin(), 250);
  });

  logoutBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logoutBtn.click();
    }
  });
})();