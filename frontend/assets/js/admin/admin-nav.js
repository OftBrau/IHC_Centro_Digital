// admin-nav.js
// Navigation for admin top buttons with logout support.
// Each .nav-btn should have a data-target attribute with the filename to open
// (e.g. "DashboardsAdmin.html", "usuarioAdmin.html", ...).
// If a button has data-logout="true" OR its text includes 'salir', it will perform logout.

document.addEventListener('DOMContentLoaded', () => {
  const navButtons = Array.from(document.querySelectorAll('.nav-menu .nav-btn'));
  if (!navButtons.length) return;

  // Keys to remove from storage on logout — adjust to your app's keys
  const keysToRemove = ['token', 'authToken', 'user', 'session', 'currentUser', 'jwt', 'access_token'];

  // Candidate login URLs (order of preference)
  const loginCandidates = [
    '../public/login.html',   // common structure if admin is in /admin and login in /public
    '../auth/login.html',
    '/auth/login.html',
    '/login.html',
    'login.html',
    '../login.html'
  ];

  // Optional: server logout endpoint (uncomment and set if you have one)
  const serverLogoutEndpoint = null; // e.g. '/api/logout'

  // Try to find a reachable login URL from candidates.
  // We'll attempt HEAD requests with timeout; if none succeed, fallback to first candidate.
  async function findReachableLogin(candidates = loginCandidates, timeout = 2500) {
    if (!Array.isArray(candidates) || !candidates.length) return candidates[0] || 'login.html';

    for (const url of candidates) {
      try {
        // Use AbortController to timeout the fetch
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        // Try a HEAD request to minimize response size.
        const resp = await fetch(url, { method: 'HEAD', signal: controller.signal, cache: 'no-store' });
        clearTimeout(id);
        // If we receive a valid HTTP response (200-399), consider it reachable
        if (resp && resp.ok) {
          return url;
        }
        // some servers may respond 405 to HEAD — accept 2xx-3xx or 405 (method not allowed) then try GET
        if (resp && resp.status === 405) {
          // try GET quickly
          const resp2 = await fetch(url, { method: 'GET', signal: controller.signal, cache: 'no-store' });
          if (resp2 && resp2.ok) return url;
        }
      } catch (err) {
        // fetch failed (network error, CORS, aborted) — ignore and try next candidate
        // console.debug('Login candidate failed:', url, err);
      }
    }
    // fallback
    return candidates[0];
  }

  async function performLogoutAndRedirect() {
    try {
      // Try to call server logout endpoint to invalidate cookies/session (if configured)
      if (serverLogoutEndpoint) {
        try {
          await fetch(serverLogoutEndpoint, { method: 'POST', credentials: 'include', cache: 'no-store' });
        } catch (err) {
          // ignore server logout errors, continue clearing client storage
          console.warn('Server logout failed (continuing client-side):', err);
        }
      }

      // Clear common auth/session keys (client-side)
      keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
        try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ }
      });

      // Optionally clear all storage (uncomment if you want)
      // try { localStorage.clear(); sessionStorage.clear(); } catch(e){}

      // Find a reachable login page and redirect there
      const loginUrl = await findReachableLogin();
      window.location.href = loginUrl;
    } catch (err) {
      console.error('Logout redirect failed:', err);
      // fallback hard redirect
      window.location.href = loginCandidates[0] || 'login.html';
    }
  }

  navButtons.forEach((btn) => {
    // Ensure there's a data-target; if not try to infer a fallback.
    let target = btn.getAttribute('data-target');
    if (!target) {
      const text = (btn.textContent || '').trim().toLowerCase();
      if (text.includes('dashboard')) target = 'DashboardsAdmin.html';
      else if (text.includes('usuarios') || text.includes('usuario')) target = 'usuarioAdmin.html';
      else if (text.includes('emergencias')) target = 'EmergenciasAdmin.html';
      else if (text.includes('medicamentos')) target = 'MedicamentosAdmin.html';
      else if (text.includes('reportes')) target = 'ReportesAdmin.html';
      else if (text.includes('config')) target = 'ConfiguracionAdmin.html';
      if (target) btn.setAttribute('data-target', target);
    }

    // Click handler
    btn.addEventListener('click', (e) => {
      // If this button has explicit logout attribute OR its label contains 'salir'
      const isLogoutAttr = btn.getAttribute('data-logout') === 'true';
      const text = (btn.textContent || '').trim().toLowerCase();
      const isLogoutText = text.includes('salir') || text.includes('cerrar sesión') || text.includes('logout');

      if (isLogoutAttr || isLogoutText) {
        // perform logout + redirect
        performLogoutAndRedirect();
        return;
      }

      const tgt = btn.getAttribute('data-target');
      if (!tgt) return;

      // update active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // navigate to target (same folder)
      window.location.href = tgt;
    });

    // Keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
});