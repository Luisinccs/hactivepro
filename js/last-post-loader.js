/**
 * Carga los últimos posts del blog desde un archivo manifest JSON y los muestra en la página.
 * @param {number} count - El número de posts más recientes a mostrar.
 * @param {string} manifestPath - Ruta al archivo JSON del manifiesto de posts, relativa al index.html.
 */
async function loadLatestPosts(count = 3, manifestPath = 'content/posts-manifest.json') {
    const introParagraphSelector = '#intro-paragraph'; // Corregido a selector de ID
    const postsContainerId = 'latest-posts-container'; // ID para la sección que contendrá los posts
    const contentBasePath = 'content/'; // Ruta base para los archivos listados en el manifiesto

    try {
        const response = await fetch(manifestPath);
        if (!response.ok) {
            console.error(`Error al cargar el manifiesto de posts desde ${manifestPath}: ${response.statusText}`);
            const introParagraphEl = document.querySelector(introParagraphSelector);
            if (introParagraphEl) {
                const errorDisplay = document.createElement('p');
                errorDisplay.textContent = 'No se pudieron cargar las últimas entradas del blog en este momento.';
                errorDisplay.style.color = 'red'; // Estilo básico, debería ir en CSS de errores globales
                introParagraphEl.parentNode.insertBefore(errorDisplay, introParagraphEl.nextSibling);
            }
            return;
        }
        const allPostsData = await response.json();

        if (!Array.isArray(allPostsData)) {
            console.error('Los datos del manifiesto de posts no son un array.');
            return;
        }

        // Filtrar posts que tengan fecha de publicación y ordenarlos (más recientes primero)
        const sortedPosts = allPostsData
            .filter(post => post.publicationDate)
            .sort((a, b) => new Date(b.publicationDate) - new Date(a.publicationDate));

        const latestPosts = sortedPosts.slice(0, count);

        if (latestPosts.length === 0) {
            console.info('No hay posts disponibles para mostrar o hay un problema con los datos de los posts.');
            return;
        }

        const introParagraph = document.querySelector(introParagraphSelector);
        if (!introParagraph) {
            console.error(`Elemento de anclaje "${introParagraphSelector}" no encontrado en el DOM.`);
            return;
        }

        let postsContainer = document.getElementById(postsContainerId);
        if (postsContainer) {
            postsContainer.innerHTML = ''; // Limpiar si se recarga
        } else {
            postsContainer = document.createElement('section');
            postsContainer.id = postsContainerId;
            postsContainer.className = 'latest-posts-section'; // Para estilos CSS
            introParagraph.parentNode.insertBefore(postsContainer, introParagraph.nextSibling);
        }
        
        const fragment = document.createDocumentFragment(); // Para mejorar rendimiento al añadir elementos

        latestPosts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'latest-post';

            // Contenedor de la imagen
            const imageContainer = document.createElement('div');
            imageContainer.className = 'post-image-container';
            const image = document.createElement('img');
            // Las imágenes de los posts están en la carpeta /img/ del raíz del sitio
            image.src = post.image ? `img/${post.image}` : 'assets/images/default-post-image.png'; // Imagen por defecto
            image.alt = post.title || 'Imagen del artículo';
            image.className = 'post-image';
            image.loading = 'lazy'; // Buena práctica para imágenes
            imageContainer.appendChild(image);

            // Contenedor de los detalles (texto)
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'post-details';

            const title = document.createElement('h3');
            title.className = 'post-title';
            const titleLink = document.createElement('a');
            // Asumimos que post.file es relativo a contentBasePath
            const postUrl = post.file ? `${contentBasePath}${post.file}` : '#';
            titleLink.href = postUrl;
            titleLink.textContent = post.title || 'Artículo sin título';
            title.appendChild(titleLink);

            // Enlace de cobertura para toda la tarjeta
            const coverLink = document.createElement('a');
            titleLink.href = post.file ? `${contentBasePath}${post.file}` : '#';
            titleLink.textContent = post.title || 'Artículo sin título';
            title.appendChild(titleLink);

            const subtitle = document.createElement('h4');
            subtitle.className = 'post-subtitle';
            subtitle.textContent = post.subtitle || '';

            const excerpt = document.createElement('p');
            excerpt.className = 'post-excerpt';
            excerpt.textContent = post.excerpt || ''; // Extracto o parte del texto

            const dateElement = document.createElement('p');
            dateElement.className = 'post-publication-date';
            const timeTag = document.createElement('time');
            if (post.publicationDate) {
                timeTag.dateTime = post.publicationDate; // Formato YYYY-MM-DD
                try {
                    // Añadir T00:00:00 para evitar problemas de zona horaria si la fecha es solo YYYY-MM-DD
                    const dateObj = new Date(post.publicationDate.includes('T') ? post.publicationDate : `${post.publicationDate}T00:00:00`);
                    if (!isNaN(dateObj)) {
                        timeTag.textContent = `Fecha de publicación: ${dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                    } else {
                        timeTag.textContent = `Fecha de publicación: ${post.publicationDate}`; // Fallback a la fecha cruda
                    }
                } catch (e) {
                     timeTag.textContent = `Fecha de publicación: ${post.publicationDate}`; // Fallback
                }
            } else {
                timeTag.textContent = 'Fecha de publicación no disponible';
            }
            dateElement.appendChild(timeTag);

            detailsContainer.appendChild(title);
            if (post.subtitle && post.subtitle.trim() !== '') detailsContainer.appendChild(subtitle);
            if (post.excerpt && post.excerpt.trim() !== '') detailsContainer.appendChild(excerpt);
            detailsContainer.appendChild(dateElement);

            // Añadir el enlace de cobertura primero para que esté "debajo" en el orden del DOM,
            // aunque su z-index lo controlará visualmente.
            coverLink.href = postUrl;
            coverLink.className = 'post-cover-link';
            coverLink.setAttribute('aria-label', `Leer más sobre ${post.title || 'este artículo'}`); // Para accesibilidad
            postElement.appendChild(coverLink); // Añadir el enlace de cobertura
            postElement.appendChild(imageContainer);
            postElement.appendChild(detailsContainer);
            fragment.appendChild(postElement);
        });
        
        postsContainer.appendChild(fragment); // Añadir todos los posts de una vez

    } catch (error) {
        console.error('Error al cargar o mostrar los últimos posts:', error);
    }
}

// Para usar esta función, llámala desde tu script principal o en tu index.html, por ejemplo:
// document.addEventListener('DOMContentLoaded', () => {
//     loadLatestPosts(3); // Carga los 3 posts más recientes usando 'content/posts-manifest.json'
//     // O especifica una ruta diferente para el manifiesto:
//     // loadLatestPosts(5, 'data/otro-manifest.json');
// });