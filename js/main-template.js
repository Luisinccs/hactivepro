// 2025-06-04
// Description: Manages the dynamic loading of HTML components.

/**
 * @brief Loads an HTML component from a given URL and injects it into an element identified by its tag name.
 * @param {string} url - The URL of the HTML component to load.
 * @param {string} destinoId - The tag name of the HTML element where the component will be injected.
 * @returns {Promise<void>} A promise that resolves when the component is loaded, or rejects on error.
 */
async function cargarComponenteByTag(url, destinoId) {
    try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) {
        throw new Error(`Error al cargar ${url}: ${respuesta.status}`);
      }
      const html = await respuesta.text();
      const elem = document.getElementsByTagName(destinoId)[0];
      if (elem) {
          elem.innerHTML = html;
      } else {
          console.error(`Error: Elemento con tag '${destinoId}' no encontrado.`);
      }
    } catch (error) {
      console.error("No se pudo cargar el componente:", error);
      // Asegúrate de que document.getElementById(destinoId) exista antes de intentar acceder a innerHTML
      const fallbackElem = document.getElementsByTagName(destinoId)[0];
      if (fallbackElem) {
          fallbackElem.innerHTML = '<p>Error al cargar el contenido.</p>';
      }
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
      // Verificar si el elemento 'header' existe antes de intentar cargar
      if (document.getElementsByTagName('header').length > 0) {
          cargarComponenteByTag('/header.html', 'header');
      } else {
          console.warn("No se encontró la etiqueta <header> en el DOM para cargar el componente.");
      }
  
      // Verificar si el elemento 'footer' existe antes de intentar cargar
      if (document.getElementsByTagName('footer').length > 0) {
          cargarComponenteByTag('/footer.html', 'footer');
      } else {
          console.warn("No se encontró la etiqueta <footer> en el DOM para cargar el componente.");
      }
  });