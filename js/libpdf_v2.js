(function(){
  "use strict";
  const students = document.getElementById('estudiantes');
  const tpl = document.getElementById('tpl');
  const countNum = document.getElementById('countNum');
  const NIVEL_UNICO = ["App.Inventor", "Tango.Gestión", "Ciencia de datos con Looker studio", "Machine Learning con Python"];
  const NIVELES_NORMALES = ["Junior", "Junior Primaria", "Fundamentos", "Avanzado", "Experto"];
  const NARANJA = [255, 87, 51];   // #FF5733

  const hoy = new Date();
  document.getElementById('fecha').value =
    String(hoy.getDate()).padStart(2,'0') + '/' +
    String(hoy.getMonth()+1).padStart(2,'0') + '/' + hoy.getFullYear();

  function renumber(){
    const cards = students.querySelectorAll('.estudiante');
    cards.forEach((c,i)=>{
      c.querySelector('.marcador').textContent = String(i+1).padStart(2,'0');
      c.querySelector('.n').textContent = i+1;
      c.querySelector('.remove').style.display = cards.length>1 ? '' : 'none';
    });
    countNum.textContent = cards.length;
    const empty = document.getElementById('emptyState');
    if(empty){ empty.style.display = cards.length ? 'none' : ''; }
  }

  function addStudent(){
  const node = tpl.content.firstElementChild.cloneNode(true);

  // botón quitar
  node.querySelector('.remove').addEventListener('click', ()=>{ node.remove(); renumber(); });

  // checkboxes con campo extra (software / acompañamiento)
  node.querySelectorAll('[data-cond]').forEach(chk=>{
    chk.addEventListener('change', ()=>{
      const cond = node.querySelector('[data-cid="'+chk.dataset.cond+'"]');
      cond.classList.toggle('show', chk.checked);
      if(!chk.checked){ cond.querySelector('input').value=''; }
    });
  });

  // predictivo de herramienta + niveles dependientes
  configurarHerramientaYNivel(node);

  students.appendChild(node);
  renumber();
  node.querySelector('[data-f="nombre"]').focus();
  node.scrollIntoView({behavior:'smooth', block:'center'});
}

  document.getElementById('addBtn').addEventListener('click', addStudent);

  function collect(){
    return [...students.querySelectorAll('.estudiante')].map(c=>{
      const val = s => (c.querySelector('[data-f="'+s+'"]')?.value || '').trim();
      const chk = s => !!c.querySelector('[data-c="'+s+'"]')?.checked;
      return {
        nombre:val('nombre'), curso:val('curso'), herramienta:val('herramienta'), nivel:val('nivel'),
        accesibilidad:chk('accesibilidad'), tiempo:chk('tiempo'),
        interpretacion:chk('interpretacion'), comprension:chk('comprension'),
        software:chk('software'), softwareCual:val('softwareCual'),
        acompanamiento:chk('acompanamiento'), acompFuncion:val('acompFuncion'),
        otras:val('otras'), informe:chk('informe'), respaldo:chk('respaldo')
      };
    });
  }

  // ====================== PDF ======================
  function buildPDF(){
    const data = collect();
    if(data.length===0){ alert('Agregá al menos un alumno antes de descargar.'); return; }

    // No permitir descargar con el nombre en blanco
    const iSinNombre = data.findIndex(s => !s.nombre);
    if(iSinNombre !== -1){
      alert('Completá el nombre y apellido del Estudiante Nº ' + (iSinNombre+1) + ' antes de descargar el PDF.');
      const card = students.querySelectorAll('.estudiante')[iSinNombre];
      if(card){
        const inp = card.querySelector('[data-f="nombre"]');
        inp.focus();
        inp.scrollIntoView({behavior:'smooth', block:'center'});
      }
      return;
    }

    // El nivel es obligatorio (salvo que la herramienta lo fije automáticamente)
    const iSinNivel = data.findIndex(s => !s.nivel);
    if(iSinNivel !== -1){
      alert('Seleccioná el nivel de certificación del Estudiante Nº ' + (iSinNivel+1) + ' antes de descargar el PDF.');
      const card = students.querySelectorAll('.estudiante')[iSinNivel];
      if(card){
        const sel = card.querySelector('[data-f="nivel"]');
        sel.focus();
        sel.scrollIntoView({behavior:'smooth', block:'center'});
      }
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm', format:'a4'});
    const PW=210, PH=297, M=20, CW=PW-M*2;
    const INK=[22,40,59], MUT=[91,107,125], ACC=[10,75,140], NAVY=[11,42,74], LINE=[210,220,232];
    let y = M;

    const colegioRaw = document.getElementById('colegio').value.trim();
    const colegio = resolverColegio(colegioRaw);   // nombre exacto del registro (o null)
    if(!colegio){
      alert('Elegí el nombre del colegio de la lista de sugerencias, tal como figura en el registro.');
      document.getElementById('colegio').focus();
      return;
    }
    const fecha = document.getElementById('fecha').value.trim();
    const resp = document.getElementById('responsable').value.trim();

    function header(){
      doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(...NARANJA);
      doc.text('DEPARTAMENTO DE APRENDIZAJE VISUAL', M, y);
      doc.setFont('helvetica','normal'); doc.setTextColor(...MUT);
      doc.text('UTN.BA · Programa Digital Junior', PW-M, y, {align:'right'});
      y += 3;
      doc.setDrawColor(...NARANJA); doc.setLineWidth(0.6); doc.line(M, y, PW-M, y);
      y += 8;
    }
    function ensure(h){ if(y+h > PH-M){ doc.addPage(); y=M; header(); } }

    function fieldLine(label,value){
      const v=value||'—';
      doc.setFont('helvetica','bold'); doc.setFontSize(9.5); doc.setTextColor(...INK);
      const labW=doc.getTextWidth(label+'  ');
      ensure(6); doc.text(label, M, y);
      doc.setFont('helvetica','normal'); doc.setTextColor(...(value?INK:MUT));
      const lines=doc.splitTextToSize(v, CW-labW);
      doc.text(lines, M+labW, y);
      y += lines.length*5 + 1.5;
    }
    function sectionTitle(t){
      ensure(11); y+=2;
      doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(...ACC);
      doc.text(t.toUpperCase(), M, y); y+=2;
      doc.setDrawColor(...LINE); doc.setLineWidth(0.5); doc.line(M, y, PW-M, y); y+=6;
    }
    function checkRow(checked,text){
      const box=3.6, gap=3, tx=M+box+gap;
      const lines=doc.splitTextToSize(text, CW-(box+gap));
      const h=Math.max(box, lines.length*4.6);
      ensure(h+2);
      doc.setLineWidth(0.35);
      if(checked){
        doc.setFillColor(...ACC); doc.setDrawColor(...ACC);
        doc.roundedRect(M, y-3.2, box, box, .6,.6,'FD');
        doc.setDrawColor(255,255,255); doc.setLineWidth(0.5);
        doc.line(M+0.9, y-1.5, M+1.5, y-0.7);
        doc.line(M+1.5, y-0.7, M+2.8, y-2.6);
      }else{
        doc.setDrawColor(170,185,205);
        doc.roundedRect(M, y-3.2, box, box, .6,.6,'S');
      }
      doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(...INK);
      doc.text(lines, tx, y);
      y += h + 1.6;
    }
    function subInfo(label,value){
      const lines=doc.splitTextToSize(label+' '+value, CW-8);
      ensure(lines.length*4.6+1);
      doc.setFont('helvetica','italic'); doc.setFontSize(9); doc.setTextColor(...MUT);
      doc.text(lines, M+8, y); y += lines.length*4.6 + 1;
    }

    data.forEach((s,idx)=>{
      if(idx>0) doc.addPage();
      y=M; header();

      if(idx===0 && (colegio||fecha||resp)){
        doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...MUT);
        let bits=[];
        if(colegio) bits.push('Institución: '+colegio);
        if(fecha) bits.push('Fecha: '+fecha);
        if(resp) bits.push('Responsable: '+resp);
        const l=doc.splitTextToSize(bits.join('    ·    '), CW);
        doc.text(l, M, y); y += l.length*4.6 + 4;
      }

      ensure(12);
      doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(...NAVY);
      doc.text('Estudiante Nº '+(idx+1), M, y); y+=7;

      fieldLine('Nombre y apellido:', s.nombre);
      fieldLine('Curso / Año:', s.curso);
      fieldLine('Herramienta a certificar:', s.herramienta);
      fieldLine('Nivel de certificación:', s.nivel);

      sectionTitle('Adecuaciones solicitadas');
      checkRow(s.accesibilidad, 'Requiere adecuaciones de accesibilidad en la presentación del material de evaluación (tipografía ampliada, mayor interlineado, resaltado de la información relevante y mejoras en la legibilidad del examen).');
      checkRow(s.tiempo, 'Requiere ampliación del tiempo de resolución.');
      checkRow(s.interpretacion, 'Requiere apoyo para la interpretación de las consignas.');
      checkRow(s.comprension, 'Requiere verificar la comprensión de las consignas antes de comenzar la evaluación.');
      checkRow(s.software, 'Utiliza software de apoyo.');
      if(s.software && s.softwareCual) subInfo('Software:', s.softwareCual);
      checkRow(s.acompanamiento, 'Requiere acompañamiento durante la evaluación.');
      if(s.acompanamiento && s.acompFuncion) subInfo('Función:', s.acompFuncion);

      sectionTitle('Otras consideraciones relevantes');
      doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(...(s.otras?INK:MUT));
      const ol=doc.splitTextToSize(s.otras||'—', CW);
      ensure(ol.length*5); doc.text(ol, M, y); y += ol.length*5 + 2;

      sectionTitle('Documentación adjunta');
      checkRow(s.informe, 'Informe profesional actualizado (psicopedagógico, interdisciplinario o equivalente).');
      checkRow(s.respaldo, 'Otra documentación de respaldo.');
    });

    const total=doc.getNumberOfPages();
    for(let p=1;p<=total;p++){
      doc.setPage(p);
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...MUT);
      doc.text('Página '+p+' de '+total, PW-M, PH-10, {align:'right'});
      doc.text('Digital Junior · UTN.BA', M, PH-10);
    }

    // Nombre del archivo: DAV_solicitud_adecuaciones_<colegio-sin-espacios>_<fecha>.pdf
    const nombreColegio = (colegio || 'colegio')
      .replace(/[\\/:*?"<>|]/g,'')  // saca caracteres inválidos para nombre de archivo
      .replace(/\s+/g,'');          // saca los espacios
    const nombreFecha = (fecha || new Date().toLocaleDateString('es-AR'))
      .replace(/[\\/:*?"<>|]/g,'-'); // reemplaza / por - (ej. 02/09/2026 -> 02-09-2026)
    doc.save('DAV_solicitud_adecuaciones_' + nombreColegio + '_' + nombreFecha + '.pdf');
  }

  document.getElementById('pdfBtn').addEventListener('click', buildPDF);
  renumber();
})();