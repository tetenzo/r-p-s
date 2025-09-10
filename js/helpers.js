
// para seleccionar un elemento del dom, se llama a la función en vez de repetir querySelector cada vez
function $(selector, contexto = document) {
  return contexto.querySelector(selector);
}

// mezcla los elementos de un arreglo
function mezclar(arreglo) {
  return [...arreglo].sort(() => Math.random() - 0.5);
}

function leerStorage(clave, porDefecto) {
  try {
    const bruto = localStorage.getItem(clave);
    return bruto === null ? porDefecto : JSON.parse(bruto);
  } catch {
    return porDefecto;
  }
}

function guardarStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}
