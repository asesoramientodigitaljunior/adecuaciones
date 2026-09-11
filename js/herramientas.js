const HERRAMIENTAS = {
  "MS.Excel": ["Junior", "Fundamentos", "Avanzado", "Experto"],
  "MS.PowerPoint": ["Junior", "Fundamentos", "Avanzado"],
  "MS.Word": ["Junior", "Fundamentos", "Avanzado", "Experto"],
  "Adobe.Photoshop": ["Fundamentos", "Avanzado"],
  "Adobe.Illustrator": ["Fundamentos", "Avanzado"],
  "Adobe.Premiere": ["Fundamentos"],
  "Diseño.Web.HTMLCSS": ["Fundamentos", "Avanzado"],
  "Scratch": ["Junior", "Fundamentos"],
  "App.Inventor": ["Único"],
  "Videojuegos": ["Fundamentos"],
  "Robótica": ["Junior Bloques", "Fund. Bloques", "Fund. Código", "Avanzado"],
  "Python": ["Fundamentos", "Avanzado"],
  "HTML.PHP": ["Fundamentos"],
  "Stop.Motion": ["Fundamentos", "Avanzado"],
  "Diseño.3D.TinkerCAD": ["Fundamentos"],
  "Diseño_e_impresión.3D_Tinkercad": ["Fundamentos"],
  "Tango.Gestión": ["Único"],
  "AutoCAD.2D.Mecánica": ["Fundamentos", "Avanzado"],
  "AutoCAD.2D.Construcción": ["Fundamentos", "Avanzado"],
  "AutoCAD.3D.Mecánica": ["Fundamentos", "Avanzado"],
  "AutoCAD.3D.Construcción": ["Fundamentos", "Avanzado"],
  "Machine.Learning.con.Python": ["Único"],
  "Dashboards.y.ciencia.de.datos": ["Único"]
};

// Devuelve el nombre EXACTO de la herramienta si el texto coincide; si no, null.
function resolverHerramienta(valor){
  const n = normalizar(valor);
  return Object.keys(HERRAMIENTAS).find(h => normalizar(h) === n) || null;
}
