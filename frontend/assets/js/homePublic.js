// homePublic.js - central script for HomePublic
// Handles: tutorial modal, smooth scroll navigation, action card navigation,
// draggable floating alert button + scroll-to-top button
// Updated: action cards now open their HTML pages (data-target), floating alert
// emits 'floatingAlert:activate' (doesn't auto-open tutorial), saved positions only if manual:true.

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------
     Smooth scroll + active nav
     --------------------------- */
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.main-nav .nav-link'));

  function headerHeight() {
    return header ? header.getBoundingClientRect().height : 0;
  }

  function scrollToElem(elem) {
    if (!elem) return;
    const rect = elem.getBoundingClientRect();
    const offsetTop = window.scrollY + rect.top - (headerHeight() + 12);
    window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });

    // accessibility focus
    const hadTab = elem.hasAttribute('tabindex');
    if (!hadTab) elem.setAttribute('tabindex', '-1');
    elem.focus({ preventScroll: true });
    if (!hadTab) elem.removeAttribute('tabindex');
  }

  function setActiveLink(link) {
    navLinks.forEach(l => l.classList.remove('active'));
    if (link) link.classList.add('active');
  }

  // Map textual link names to sections without changing your HTML
  const findLinkByText = txt => navLinks.find(a => a.textContent.trim().toLowerCase() === txt.toLowerCase());

  const nosotrosLink = findLinkByText('nosotros');
  const herramientasLink = findLinkByText('herramientas');
  const homeLink = findLinkByText('home');

  const introSection = document.getElementById('nosotros');
  const accionesSection = document.getElementById('herramientas');
  const homeSection = document.getElementById('home');

  if (nosotrosLink && introSection) {
    nosotrosLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToElem(introSection);
      setActiveLink(nosotrosLink);
      history.replaceState(null, '', '#nosotros');
    });
  }
  if (herramientasLink && accionesSection) {
    herramientasLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToElem(accionesSection);
      setActiveLink(herramientasLink);
      history.replaceState(null, '', '#herramientas');
    });
  }
  if (homeLink && homeSection) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToElem(homeSection);
      setActiveLink(homeLink);
      history.replaceState(null, '', '#home');
    });
  }

  // Update active link on manual scroll using IntersectionObserver
  const sections = [
    { id: 'home', link: homeLink },
    { id: 'nosotros', link: nosotrosLink },
    { id: 'herramientas', link: herramientasLink }
  ].filter(s => document.getElementById(s.id));

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const match = sections.find(s => s.id === sectionId);
          if (match && match.link) setActiveLink(match.link);
        }
      });
    }, { threshold: 0.45 }); // 45% visible
    sections.forEach(s => observer.observe(document.getElementById(s.id)));
  }

  // If page loads with hash, scroll to it
  if (location.hash) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) setTimeout(() => scrollToElem(target), 80);
  }

  /* ---------------------------
     Action cards: open their HTMLs
     --------------------------- */
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const target = card.getAttribute('data-target');
      if (!target) return;
      // Navigate in the same folder as the current page (relative)
      // If you want to open in a new tab, use window.open(target, '_blank')
      window.location.href = target;
    });

    // keyboard accessibility: Enter/Space should activate
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ---------------------------
     Tutorial modal (slides + progress)
     --------------------------- */
  (function tutorialModule() {
    const tutorialBtn = document.getElementById('tutorialBtn');
    const modal = document.getElementById('tutorialModal');
    if (!tutorialBtn || !modal) return;

    const overlay = modal.querySelector('.tutorial-overlay');
    const closeBtn = document.getElementById('tutorialClose');
    const prevBtn = document.getElementById('tutorialPrev');
    const nextBtn = document.getElementById('tutorialNext');
    const content = document.getElementById('tutorialContent');
    const slides = Array.from(modal.querySelectorAll('.tutorial-slide'));
    const progressBar = document.getElementById('tutorialProgressBar');
    const stepLabel = document.getElementById('tutorialStep');
    const totalLabel = document.getElementById('tutorialTotal');
    const pctLabel = document.getElementById('tutorialPct');
    const dotsWrap = document.getElementById('tutorialDots');
    const dotsInlineWrap = modal.querySelector('.tutorial-dots-inline');

    let index = 0;
    const total = slides.length;
    if (totalLabel) totalLabel.textContent = total;

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const d = document.createElement('span');
        d.className = 'tutorial-dot' + (i === index ? ' active' : '');
        d.dataset.i = i;
        d.tabIndex = 0;
        d.addEventListener('click', () => goTo(Number(d.dataset.i)));
        d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') goTo(Number(d.dataset.i)); });
        dotsWrap.appendChild(d);
      }
      if (dotsInlineWrap) {
        dotsInlineWrap.innerHTML = '';
        for (let i = 0; i < total; i++) {
          const di = document.createElement('span');
          di.className = 'tutorial-dot-inline' + (i === index ? ' active' : '');
          dotsInlineWrap.appendChild(di);
        }
      }
    }

    function updateProgressUI() {
      const pct = (total <= 1) ? 100 : Math.round(((index) / (total - 1)) * 100);
      if (progressBar) progressBar.style.width = pct + '%';
      if (pctLabel) pctLabel.textContent = pct + '%';
      if (stepLabel) stepLabel.textContent = `Paso ${index + 1}`;
    }

    function openModal(start = 0) {
      index = start;
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      updateUI();
      setTimeout(() => content.focus(), 120);
    }

    function closeModal() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function updateUI() {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      updateProgressUI();
      prevBtn.disabled = index === 0;
      nextBtn.textContent = (index === total - 1) ? 'Finalizar' : 'Siguiente ›';
      renderDots();
    }

    function goTo(i) {
      if (i < 0) i = 0;
      if (i >= total) i = total - 1;
      index = i;
      updateUI();
    }

    tutorialBtn.addEventListener('click', (ev) => { ev.preventDefault(); openModal(0); });
    overlay.addEventListener('click', () => closeModal());
    closeBtn.addEventListener('click', () => closeModal());

    prevBtn.addEventListener('click', () => { if (index > 0) goTo(index - 1); });
    nextBtn.addEventListener('click', () => {
      if (index >= total - 1) { closeModal(); return; }
      goTo(index + 1);
    });

    document.addEventListener('keydown', (ev) => {
      if (!modal.classList.contains('show')) return;
      if (ev.key === 'Escape') closeModal();
      if (ev.key === 'ArrowLeft') goTo(index - 1);
      if (ev.key === 'ArrowRight') goTo(index + 1);
    });

    renderDots();
    updateProgressUI();
  })();

  /* ---------------------------
     Floating draggable alert + scroll-to-top
     (no new button created; uses #floatingAlert already in HTML)
     behavior:
       - only applies saved pos if {manual:true}
       - on drag end saves {left, top, manual:true}
       - click dispatches 'floatingAlert:activate' event (don't open tutorial here)
       - ignores click immediately after drag
  --------------------------- */
  (function floatingButtons() {
    const alertBtn = document.getElementById('floatingAlert');
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (!alertBtn || !scrollBtn) return;

    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
    const POS_KEY = 'floatingAlertPos_v1';

    // Try to apply saved pos ONLY if manual:true
    let appliedSaved = false;
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (raw) {
        const pos = JSON.parse(raw);
        if (pos && typeof pos.left === 'number' && typeof pos.top === 'number' && pos.manual === true) {
          alertBtn.style.left = pos.left + 'px';
          alertBtn.style.top = pos.top + 'px';
          alertBtn.style.right = 'auto';
          alertBtn.style.bottom = 'auto';
          appliedSaved = true;
        }
      }
    } catch (e) { console.warn('Error reading floating pos:', e); }

    // If not applied, ensure CSS default is used
    if (!appliedSaved) {
      alertBtn.style.left = '';
      alertBtn.style.top = '';
      alertBtn.style.right = '24px';
      alertBtn.style.bottom = '100px';
    }

    // drag state
    let dragging = false;
    let startX = 0, startY = 0, origLeft = 0, origTop = 0;
    let moved = false;
    let lastWasDrag = false;
    const MOVE_THRESHOLD = 6;

    alertBtn.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      alertBtn.setPointerCapture(ev.pointerId);
      dragging = true;
      moved = false;
      const rect = alertBtn.getBoundingClientRect();
      const style = window.getComputedStyle(alertBtn);
      const left = parseFloat(style.left);
      const top = parseFloat(style.top);
      origLeft = Number.isFinite(left) ? left : rect.left;
      origTop = Number.isFinite(top) ? top : rect.top;
      startX = ev.clientX; startY = ev.clientY;
    });

    alertBtn.addEventListener('pointermove', (ev) => {
      if (!dragging) return;
      ev.preventDefault();
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > MOVE_THRESHOLD) moved = true;
      const newLeft = origLeft + dx;
      const newTop = origTop + dy;
      const vw = window.innerWidth, vh = window.innerHeight;
      const btnW = alertBtn.offsetWidth, btnH = alertBtn.offsetHeight;
      const leftClamped = clamp(newLeft, 8, vw - btnW - 8);
      const topClamped = clamp(newTop, 8, vh - btnH - 8);
      alertBtn.style.left = leftClamped + 'px';
      alertBtn.style.top = topClamped + 'px';
      alertBtn.style.right = 'auto'; alertBtn.style.bottom = 'auto';
    });

    alertBtn.addEventListener('pointerup', (ev) => {
      if (!dragging) return;
      ev.preventDefault();
      alertBtn.releasePointerCapture(ev.pointerId);
      dragging = false;

      const rect = alertBtn.getBoundingClientRect();
      const vw = window.innerWidth;
      const btnW = alertBtn.offsetWidth;
      const centerX = rect.left + rect.width / 2;
      const snapLeft = centerX < vw / 2;
      const finalLeft = snapLeft ? 8 : vw - btnW - 8;
      alertBtn.style.transition = 'left .18s ease, top .12s ease';
      alertBtn.style.left = finalLeft + 'px';
      const finalTop = clamp(rect.top, 8, window.innerHeight - rect.height - 8);
      alertBtn.style.top = finalTop + 'px';
      alertBtn.style.right = 'auto';

      lastWasDrag = moved;

      const persist = () => {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify({ left: Math.round(finalLeft), top: Math.round(finalTop), manual: true }));
        } catch (e) {}
        alertBtn.style.transition = '';
        alertBtn.removeEventListener('transitionend', persist);
      };
      if (getComputedStyle(alertBtn).transitionDuration !== '0s') {
        alertBtn.addEventListener('transitionend', persist);
      } else {
        persist();
      }

      moved = false;
      setTimeout(() => { lastWasDrag = false; }, 300);
    });

    alertBtn.addEventListener('pointercancel', () => {
      dragging = false;
      moved = false;
    });

    // click action: dispatch custom event (ignored if just dragged)
    alertBtn.addEventListener('click', (ev) => {
      if (lastWasDrag) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }
      const evt = new CustomEvent('floatingAlert:activate', { bubbles: true });
      alertBtn.dispatchEvent(evt);
    });

    // allow keyboard activation to dispatch same event
    alertBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const evt = new CustomEvent('floatingAlert:activate', { bubbles: true });
        alertBtn.dispatchEvent(evt);
      }
    });

    // Scroll-to-top show/hide and click
    const SHOW_AFTER = 240;
    function onScroll() {
      if (window.scrollY > SHOW_AFTER) {
        scrollBtn.classList.add('show'); scrollBtn.removeAttribute('hidden');
      } else {
        scrollBtn.classList.remove('show'); scrollBtn.setAttribute('hidden', 'true');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // accessibility: make buttons focusable if not already
    [alertBtn, scrollBtn].forEach(btn => { if (!btn.hasAttribute('tabindex')) btn.tabIndex = 0; });

    // clamp stored pos on resize
    window.addEventListener('resize', () => {
      try {
        const raw = localStorage.getItem(POS_KEY);
        if (!raw) return;
        const pos = JSON.parse(raw);
        if (!pos || typeof pos.left !== 'number' || typeof pos.top !== 'number') return;
        const vw = window.innerWidth, vh = window.innerHeight;
        const btnW = alertBtn.offsetWidth, btnH = alertBtn.offsetHeight;
        const left = clamp(pos.left, 8, vw - btnW - 8);
        const top = clamp(pos.top, 8, vh - btnH - 8);
        alertBtn.style.left = left + 'px';
        alertBtn.style.top = top + 'px';
        localStorage.setItem(POS_KEY, JSON.stringify({ left: Math.round(left), top: Math.round(top), manual: true }));
      } catch (e) {}
    });

  })();

}); // DOMContentLoaded end