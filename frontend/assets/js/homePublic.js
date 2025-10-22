// homePublic.js — Interacciones para HomePublic.html

(function () {
  'use strict';

  // ========== HERO ATTENTION BUTTON ==========
  const heroAttention = document.getElementById("heroAttention");
  
  if (heroAttention) {
    heroAttention.addEventListener("click", function() {
      alert("⚠️ Atención: Si necesitas soporte urgente, llama al 123-456-789.");
    });
  }

  // ========== ACTION CARDS NAVIGATION ==========
  const actionCards = document.querySelectorAll(".action-card");
  
  actionCards.forEach(function(card) {
    card.addEventListener("click", function() {
      const target = card.getAttribute("data-target");
      
      // Verificar que existe un target antes de navegar
      if (target) {
        window.location.href = target;
      } else {
        console.warn("Esta tarjeta no tiene una URL de destino configurada.");
      }
    });

    // Efecto de feedback visual al hacer click
    card.addEventListener("mousedown", function() {
      card.style.transform = "translateY(-4px) scale(0.98)";
    });

    card.addEventListener("mouseup", function() {
      card.style.transform = "";
    });

    card.addEventListener("mouseleave", function() {
      card.style.transform = "";
    });
  });

  // ========== SMOOTH SCROLL (OPCIONAL) ==========
  // Si agregas enlaces ancla en el futuro
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      
      if (targetId !== "#" && document.querySelector(targetId)) {
        e.preventDefault();
        document.querySelector(targetId).scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  });

  // ========== CONSOLE LOG (para debugging) ==========
  console.log("✅ homePublic.js cargado correctamente");
  console.log("Tarjetas de acción encontradas:", actionCards.length);

})();