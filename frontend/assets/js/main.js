// main.js - punto de entrada para scripts
(function () {
  function ready() {
    const page = document.body.dataset.page || '';
    console.log('Página detectada:', page);
  }
  document.addEventListener('DOMContentLoaded', ready);
})();
