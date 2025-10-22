// Smooth scroll handler for header nav anchors (#herramientas, #nosotros, etc.)
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const headerHeight = () => (header ? header.getBoundingClientRect().height : 0);

  // Smooth scroll to anchor with offset equal to header height + small gap
  function scrollToElem(elem) {
    if (!elem) return;
    const rect = elem.getBoundingClientRect();
    const offsetTop = window.scrollY + rect.top - (headerHeight() + 12);
    window.scrollTo({
      top: Math.max(0, offsetTop),
      behavior: 'smooth'
    });
    // for accessibility, focus the target (temporarily make it focusable)
    const prevTab = elem.getAttribute('tabindex');
    if (!prevTab) elem.setAttribute('tabindex', '-1');
    elem.focus({preventScroll: true});
    if (!prevTab) elem.removeAttribute('tabindex');
  }

  // Attach click handlers for in-page nav links
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#') || href === '#') return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      scrollToElem(target);

      // update active state visually
      document.querySelectorAll('.main-nav .nav-link').forEach(n => n.classList.remove('active'));
      link.classList.add('active');
      // update URL hash without jumping
      history.replaceState(null, '', `#${id}`);
    });
  });

  // If page loads with a hash, scroll to it (after short delay to let layout settle)
  if (location.hash) {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      setTimeout(() => scrollToElem(target), 80);
    }
  }
});