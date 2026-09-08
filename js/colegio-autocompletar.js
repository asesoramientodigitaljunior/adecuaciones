(function(){
  "use strict";
  const input = document.getElementById('colegio');
  const box   = document.getElementById('colegioSugerencias');
  if(!input || !box || typeof COLEGIOS === 'undefined') return;

  let items = [];     // colegios que se están mostrando
  let indice = -1;    // opción resaltada con el teclado

  function abrir(lista){
    items = lista;
    if(!lista.length){ cerrar(); return; }
    const q = normalizar(input.value);
    box.innerHTML = lista.map((nombre, i) => {
      // resalta en negrita la parte que coincide con lo escrito
      const pos = normalizar(nombre).indexOf(q);
      let etiqueta = nombre;
      if(q && pos >= 0){
        etiqueta = nombre.slice(0, pos) +
                   '<span class="match">' + nombre.slice(pos, pos + q.length) + '</span>' +
                   nombre.slice(pos + q.length);
      }
      return '<li role="option" data-i="' + i + '">' + etiqueta + '</li>';
    }).join('');
    box.classList.add('abierta');
    input.setAttribute('aria-expanded', 'true');
    indice = -1;
  }

  function cerrar(){
    box.classList.remove('abierta');
    box.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    indice = -1;
  }

  function elegir(nombre){
    input.value = nombre;   // deja el nombre exacto del registro
    cerrar();
    input.focus();
  }

  input.addEventListener('input', () => {
    const q = normalizar(input.value);
    if(q.length < 2){ cerrar(); return; }          // sugiere a partir de 2 letras
    const coincidencias = COLEGIOS
      .filter(c => normalizar(c).includes(q))
      .slice(0, 8);                                 // muestra hasta 8
    abrir(coincidencias);
  });

  box.addEventListener('click', e => {
    const li = e.target.closest('li');
    if(li) elegir(items[li.dataset.i]);
  });

  input.addEventListener('keydown', e => {
    const lis = [...box.querySelectorAll('li')];
    if(!box.classList.contains('abierta') || !lis.length) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); indice = Math.min(indice + 1, lis.length - 1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); indice = Math.max(indice - 1, 0); }
    else if(e.key === 'Enter' && indice >= 0){ e.preventDefault(); elegir(items[indice]); return; }
    else if(e.key === 'Escape'){ cerrar(); return; }
    else return;
    lis.forEach((li, i) => li.classList.toggle('activa', i === indice));
    if(indice >= 0) lis[indice].scrollIntoView({block:'nearest'});
  });

  // cerrar si hago clic fuera del campo
  document.addEventListener('click', e => {
    if(!e.target.closest('.field')) cerrar();
  });
})();
