// admin-nav.js
// Navigation for admin top buttons with logout support.
// Each .nav-btn should have a data-target attribute with the filename to open
// (e.g. "DashboardsAdmin.html", "usuarioAdmin.html", ...).
// If a button has data-logout="true" OR its text includes 'salir', it will perform logout.

// Config overrides (optional):
// window.ADMIN_LOGIN_CANDIDATES = [...];
// window.ADMIN_LOGOUT_ENDPOINT = '/api/logout';

document.addEventListener('DOMContentLoaded', () => {
  // Query nav buttons at runtime (will pick up the desktop menu)
  const navButtons = Array.from(document.querySelectorAll('.nav-menu .nav-btn'));
  if (!navButtons.length) return;

  // Keys to remove from storage on logout — adjust to your app's keys
  const keysToRemove = ['token', 'authToken', 'user', 'session', 'currentUser', 'jwt', 'access_token'];

  // Candidate login URLs (order of preference). Can be overridden by window.ADMIN_LOGIN_CANDIDATES
  const defaultLoginCandidates = [
    '../public/login.html',
    '../auth/login.html',
    '/auth/login.html',
    '/login.html',
    'login.html',
    '../login.html'
  ];
  const loginCandidates = Array.isArray(window.ADMIN_LOGIN_CANDIDATES) && window.ADMIN_LOGIN_CANDIDATES.length
    ? window.ADMIN_LOGIN_CANDIDATES
    : defaultLoginCandidates;

  // Optional: server logout endpoint (uncomment and set if you have one) or override via window.ADMIN_LOGOUT_ENDPOINT
  const serverLogoutEndpoint = (typeof window.ADMIN_LOGOUT_ENDPOINT === 'string' && window.ADMIN_LOGOUT_ENDPOINT.trim()) 
    ? window.ADMIN_LOGOUT_ENDPOINT.trim() 
    : null;

  // Try to find a reachable login URL from candidates.
  // We'll attempt HEAD requests with timeout; if none succeed, fallback to first candidate.
  async function findReachableLogin(candidates = loginCandidates, timeout = 2200) {
    if (!Array.isArray(candidates) || !candidates.length) return candidates[0] || 'login.html';

    for (const rawUrl of candidates) {
      // Resolve relative URLs against current location
      let url;
      try {
        url = new URL(rawUrl, window.location.href).href;
      } catch (err) {
        // If cannot parse, skip
        continue;
      }

      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        // First try HEAD
        let resp = await fetch(url, { method: 'HEAD', signal: controller.signal, cache: 'no-store', credentials: 'same-origin' });
        clearTimeout(id);

        if (resp && (resp.ok || (resp.status >= 200 && resp.status < 400))) {
          return url;
        }

        // Some servers reject HEAD (405) — do a quick GET as fallback
        if (resp && resp.status === 405) {
          const controller2 = new AbortController();
          const id2 = setTimeout(() => controller2.abort(), timeout);
          try {
            const resp2 = await fetch(url, { method: 'GET', signal: controller2.signal, cache: 'no-store', credentials: 'same-origin' });
            clearTimeout(id2);
            if (resp2 && resp2.ok) return url;
          } catch (err2) {
            // ignore and continue
            clearTimeout(id2);
          }
        }
      } catch (err) {
        // fetch failed (network, CORS or timeout). We cannot reliably detect file existence across origins due to CORS.
        // Continue to next candidate.
      }
    }

    // fallback — return first candidate resolved
    try {
      return new URL(candidates[0], window.location.href).href;
    } catch (e) {
      return candidates[0] || 'login.html';
    }
  }

  async function performLogoutAndRedirect() {
    try {
      // Call server logout to invalidate session/cookie if endpoint provided
      if (serverLogoutEndpoint) {
        try {
          // Use credentials include if your logout uses cookies
          await fetch(serverLogoutEndpoint, { method: 'POST', credentials: 'include', cache: 'no-store' });
        } catch (err) {
          // ignore server logout errors, continue clearing client storage
          console.warn('Server logout call failed (continuing client-side):', err);
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
      const fallback = (loginCandidates && loginCandidates.length) ? loginCandidates[0] : 'login.html';
      try {
        window.location.href = new URL(fallback, window.location.href).href;
      } catch (e) {
        window.location.href = fallback;
      }
    }
  }

  // Helper: derive default data-target values from button text if missing
  function inferTargetFromText(btn) {
    let target = btn.getAttribute('data-target');
    if (target) return target;

    const text = (btn.textContent || '').trim().toLowerCase();
    if (text.includes('dashboard')) target = 'DashboardsAdmin.html';
    else if (text.includes('usuarios') || text.includes('usuario')) target = 'usuarioAdmin.html';
    else if (text.includes('emergencias')) target = 'EmergenciasAdmin.html';
    else if (text.includes('medicamentos')) target = 'MedicamentosAdmin.html';
    else if (text.includes('reportes') || text.includes('reporte')) target = 'ReporteAdmin.html';
    else if (text.includes('config')) target = 'ConfiguracionAdmin.html';

    if (target) btn.setAttribute('data-target', target);
    return target;
  }

  // Apply active state based on current filename (optional convenience)
  const currentFile = (window.location.pathname || '').split('/').pop();
  if (currentFile) {
    navButtons.forEach(b => {
      const t = b.getAttribute('data-target') || '';
      // Normalize and compare filenames
      if (t && t.split('/').pop() === currentFile) {
        b.classList.add('active');
      }
    });
  }

  // Attach handlers
  navButtons.forEach((btn) => {
    // infer data-target when missing
    inferTargetFromText(btn);

    // Click handler
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // If this button has explicit logout attribute OR its label contains 'salir'
      const isLogoutAttr = btn.getAttribute('data-logout') === 'true';
      const text = (btn.textContent || '').trim().toLowerCase();
      const isLogoutText = text.includes('salir') || text.includes('cerrar sesión') || text.includes('logout');

      if (isLogoutAttr || isLogoutText) {
        // perform logout + redirect (async)
        performLogoutAndRedirect();
        return;
      }

      const tgt = btn.getAttribute('data-target');
      if (!tgt) return;

      // update active state visually for the current page
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // navigate to target (resolved relative to current location)
      try {
        const dest = new URL(tgt, window.location.href).href;
        window.location.href = dest;
      } catch (err) {
        // fallback: just set raw href
        window.location.href = tgt;
      }
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