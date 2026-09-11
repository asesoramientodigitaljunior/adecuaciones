function configurarHerramientaYNivel(node){
  const inputH = node.querySelector('[data-f="herramienta"]');   // <input> con predictivo
  const boxH   = node.querySelector('[data-sug="herramienta"]');  // <ul> de sugerencias
  const selN   = node.querySelector('[data-f="nivel"]');          // <select> de nivel
  if(!inputH || !boxH || !selN) return;

  const nombres = Object.keys(HERRAMIENTAS);
  let items = [], idx = -1;

  // ---- arma el select de Nivel según la herramienta elegida ----
  function rellenarNivel(){
    const herr = resolverHerramienta(inputH.value);
    const niveles = herr ? HERRAMIENTAS[herr] : [];
    if(!niveles.length){
      selN.innerHTML = '<option value="" disabled selected>Elegí primero una herramienta</option>';
      selN.disabled = true;
      return;
    }
    if(niveles.length === 1){                 // un solo nivel: queda fijo
      selN.innerHTML = '<option>' + niveles[0] + '</option>';
      selN.value = niveles[0];
      selN.disabled = true;
    } else {
      const previo = selN.value;
      selN.innerHTML = '<option value="" disabled selected>Seleccionar…</option>' +
        niveles.map(n => '<option>' + n + '</option>').join('');
      selN.disabled = false;
      if(niveles.includes(previo)) selN.value = previo;  // conserva la elección si sigue siendo válida
    }
  }

  // buscador predictivo de la herramienta 
  function abrir(lista){
    items = lista;
    if(!lista.length){ cerrar(); return; }
    const q = normalizar(inputH.value);
    boxH.innerHTML = lista.map((nom, i) => {
      const pos = normalizar(nom).indexOf(q);
      let et = nom;
      if(q && pos >= 0){
        et = nom.slice(0, pos) + '<span class="match">' + nom.slice(pos, pos + q.length) + '</span>' + nom.slice(pos + q.length);
      }
      return '<li role="option" data-i="' + i + '">' + et + '</li>';
    }).join('');
    boxH.classList.add('abierta');
    idx = -1;
  }
  function cerrar(){ boxH.classList.remove('abierta'); boxH.innerHTML = ''; idx = -1; }
  function elegir(nom){ inputH.value = nom; cerrar(); rellenarNivel(); }

  inputH.addEventListener('input', () => {
    rellenarNivel();                       // si cambian/borran, el nivel se actualiza
    const q = normalizar(inputH.value);
    if(q.length < 1){ cerrar(); return; }
    abrir(nombres.filter(h => normalizar(h).includes(q)).slice(0, 10));
  });

  boxH.addEventListener('click', e => {
    const li = e.target.closest('li');
    if(li) elegir(items[li.dataset.i]);
  });

  inputH.addEventListener('keydown', e => {
    const lis = [...boxH.querySelectorAll('li')];
    if(!boxH.classList.contains('abierta') || !lis.length) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); idx = Math.min(idx + 1, lis.length - 1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); idx = Math.max(idx - 1, 0); }
    else if(e.key === 'Enter' && idx >= 0){ e.preventDefault(); elegir(items[idx]); return; }
    else if(e.key === 'Escape'){ cerrar(); return; }
    else return;
    lis.forEach((li, i) => li.classList.toggle('activa', i === idx));
    if(idx >= 0) lis[idx].scrollIntoView({block:'nearest'});
  });

  // al salir del campo: cierra la lista y, si lo escrito coincide, deja el nombre exacto
  inputH.addEventListener('blur', () => {
    setTimeout(cerrar, 150);               // da tiempo al clic sobre una sugerencia
    const canon = resolverHerramienta(inputH.value);
    if(canon && canon !== inputH.value){ inputH.value = canon; rellenarNivel(); }
  });

  rellenarNivel();  // estado inicial
}
