// account-modal.js — abre/cierra el modal de Ajustes de Cuenta

document.addEventListener('DOMContentLoaded', () => {
  const accountBtn = document.getElementById('accountCard');
  const modal = document.getElementById('accountModal');
  if (!accountBtn || !modal) return;

  const overlay = modal.querySelector('.account-overlay');
  const closeBtn = document.getElementById('accountClose');
  const cancelBtn = document.getElementById('cancelAccount');
  const saveBtn = document.getElementById('saveAccount');
  const form = document.getElementById('accountForm');

  function openModal() {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector('input, select, button');
    if (first) first.focus();
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    accountBtn.focus();
  }

  accountBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  if (overlay) overlay.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  if (saveBtn && form) {
    saveBtn.addEventListener('click', () => {
      const name = form.fullName;
      const email = form.email;
      if (!name.value.trim() || !email.value.trim()) {
        alert('Por favor completa los campos requeridos (nombre y correo).');
        return;
      }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando...';
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar cambios';
        closeModal();
        const toast = document.createElement('div');
        toast.textContent = 'Cambios guardados';
        toast.style.position = 'fixed';
        toast.style.right = '18px';
        toast.style.bottom = '18px';
        toast.style.background = 'linear-gradient(90deg,#5aa6ff,#2fb6d6)';
        toast.style.color = '#fff';
        toast.style.padding = '10px 12px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2400);
      }, 900);
    });
  }
});