// admin-nav.js
// Mejora del manejo de navegación: toggle móvil, clonación del menú para móvil,
// manejo de data-target y data-logout, accesibilidad básica.

document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('.header');
  const originalNav = document.querySelector('.nav-menu');
  const toggleBtn = document.querySelector('.nav-toggle');

  if (!header || !originalNav) return;

  // If there is already a toggle in DOM use it, otherwise create one (defensive)
  const ensureToggle = () => {
    if (toggleBtn) return toggleBtn;
    const t = document.createElement('button');
    t.className = 'nav-toggle';
    t.setAttribute('aria-expanded', 'false');
    t.setAttribute('aria-label', 'Abrir menú de navegación');
    t.textContent = '☰';
    header.querySelector('.nav-container')?.prepend(t);
    return t;
  };

  const toggle = ensureToggle();

  // Clone nav for mobile behavior (keeps original desktop nav intact)
  const mobileNav = originalNav.cloneNode(true);
  mobileNav.classList.add('mobile');
  // Remove potential duplicate IDs
  mobileNav.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  // Append mobile nav to header (will be positioned by CSS)
  header.appendChild(mobileNav);

  const setOpen = (open) => {
    if (open) {
      mobileNav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
    } else {
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú de navegación');
    }
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!mobileNav.classList.contains('open'));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !toggle.contains(e.target)) {
      setOpen(false);
    }
  });

  // Handle nav clicks for both original and mobile navs
  const handleNavClick = (btn) => {
    const target = btn.getAttribute('data-target');
    const isLogout = btn.getAttribute('data-logout') === 'true';

    if (isLogout) {
      // Reemplaza con la lógica real de logout si la tienes (fetch / redirect)
      if (confirm('¿Deseas cerrar sesión?')) {
        window.location.href = '/logout';
      }
      return;
    }

    if (target) {
      // Navegar a la ruta relativa indicada en data-target
      window.location.href = target;
    }
  };

  [originalNav, mobileNav].forEach(nav => {
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (!btn) return;
      e.preventDefault();
      handleNavClick(btn);
      if (nav === mobileNav) setOpen(false);
    });

    // keyboard activation
    nav.addEventListener('keydown', (e) => {
      const btn = e.target.closest('.nav-btn');
      if (!btn) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNavClick(btn);
        if (nav === mobileNav) setOpen(false);
      }
    });
  });

  // Ensure mobile menu closed on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      setOpen(false);
    }
  });

  // Improve active state based on current location (optional)
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const t = btn.getAttribute('data-target');
    if (t && current && current === t) {
      btn.classList.add('active');
    }
  });
});