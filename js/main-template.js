// 2025-06-04
// Description: Manages the dynamic loading of HTML components.

/**
 * @brief Checks if the current device is likely a mobile device based on screen width.
 * @returns {boolean} True if it's a mobile device, false otherwise.
 */
function isMobileDevice() {
    // Use the same breakpoint as the CSS media query in layout-main.css
    return window.matchMedia('(max-width: 768px)').matches;
}

/**
 * @brief Loads an HTML component from a given URL and injects it into the provided target DOM element.
 * @param {string} url - The URL of the HTML component to load.
 * @param {HTMLElement} targetElement - The DOM element where the component will be injected.
 * @returns {Promise<void>} A promise that resolves when the component is loaded, or rejects on error.
 */
async function cargarComponente(url, targetElement) {
    if (!targetElement) {
        console.error(`Error: El elemento destino no fue proporcionado para cargar ${url}.`);
        throw new Error(`Elemento destino no proporcionado para ${url}.`);
    }

    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error(`HTTP error ${respuesta.status} al cargar ${url}`);
        }
        const html = await respuesta.text();
        targetElement.innerHTML = html;
    } catch (error) {
        console.error(`No se pudo cargar el componente desde ${url} en el elemento destino:`, error);
        targetElement.innerHTML = `<p>Error al cargar contenido para ${tagName}.</p>`;
        // Re-lanzar el error es importante para que Promise.all lo detecte
        // y el bloque catch principal en DOMContentLoaded pueda manejarlo.
        throw error;
    }
}

/**
 * @brief Manages the dark mode functionality.
 */
function initializeDarkModeToggle() {
    const D_MODE_TOGGLE_DESKTOP_SELECTOR = '.dark-mode-toggle-desktop';
    const D_MODE_TOGGLE_MOBILE_SELECTOR = '.dark-mode-toggle-mobile';
    const THEME_KEY = 'theme';
    const DARK_THEME_CLASS = 'dark-mode';
    const LIGHT_ICON = '🌙'; // Icon to show when light mode is active (click to switch to dark)
    const DARK_ICON = '☀️';  // Icon to show when dark mode is active (click to switch to light)

    const desktopToggle = document.querySelector(D_MODE_TOGGLE_DESKTOP_SELECTOR);
    const mobileToggle = document.querySelector(D_MODE_TOGGLE_MOBILE_SELECTOR);
    const body = document.body;

    /**
     * Applies the specified theme (dark or light).
     * @param {string} theme - The theme to apply ('dark' or 'light').
     */
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add(DARK_THEME_CLASS);
            if (desktopToggle) desktopToggle.textContent = DARK_ICON;
            if (mobileToggle) mobileToggle.textContent = DARK_ICON;
        } else {
            body.classList.remove(DARK_THEME_CLASS);
            if (desktopToggle) desktopToggle.textContent = LIGHT_ICON;
            if (mobileToggle) mobileToggle.textContent = LIGHT_ICON;
        }
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * Toggles between light and dark themes.
     */
    function toggleTheme() {
        const currentTheme = localStorage.getItem(THEME_KEY) || (body.classList.contains(DARK_THEME_CLASS) ? 'dark' : 'light');
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }

    // Add event listeners
    if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);
    if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);

    // Set initial theme based on localStorage or system preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light'); // Default to light theme
    }
}

/**
 * @brief Initializes the hamburger menu functionality for mobile.
 */
function initializeHamburgerMenu() {
    // console.log('hamburger menu initializing');
    const hamburgerIcon = document.querySelector('.hamburger-menu-icon');
    const mainNav = document.querySelector('.nav-items-mobile');
    const NAV_OPEN_CLASS = 'is-open'; // Class to toggle on nav

    if (hamburgerIcon && mainNav) {
        hamburgerIcon.addEventListener('click', () => {
            mainNav.classList.toggle(NAV_OPEN_CLASS);
            hamburgerIcon.textContent = mainNav.classList.contains(NAV_OPEN_CLASS) ? '✕' : '☰';
        });
    } else {
        console.warn("Hamburger menu icon or main navigation not found. Hamburger menu functionality not initialized.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // --- Get base containers ---
        const bodyElement = document.body;
        const siteContainer = document.querySelector('.site-container');
        const mainElement = document.querySelector('.site-container main'); // More specific selector

        if (!bodyElement || !siteContainer || !mainElement) {
            console.error("Error crítico: No se encontró 'body', '.site-container' o 'main' dentro de '.site-container'. No se pueden inyectar los componentes principales.");
            return; // Detener la ejecución si los contenedores base no existen
        }

        // if(!isMobileDevice()){
        //     const headerElement = document.createElement('header');
        //     bodyElement.insertBefore(headerElement, siteContainer);
        //     cargarComponente('/complements/header.html', headerElement);
        // } 

        // --- 1. Create all structural elements ---
        const navElement = document.createElement('nav');
        navElement.classList.add('main-nav'); // Importante para que los estilos CSS apliquen
        const subscriptionSectionElement = document.createElement('section');
        subscriptionSectionElement.classList.add('subscription-section');
        const footerElement = document.createElement('footer');

        // --- 2. Load content into these elements in parallel ---
        const navUrl = isMobileDevice() ? '/complements/nav-mobile.html' : '/complements/nav-regular.html';
        const loadNavContentPromise = cargarComponente(navUrl, navElement);
        const loadSubscriptionContentPromise = cargarComponente('/complements/subscription-section.html', subscriptionSectionElement);
        const loadFooterContentPromise = cargarComponente('/complements/footer.html', footerElement);

        bodyElement.insertBefore(navElement, siteContainer);

        // Wait for all content to be loaded
        await Promise.all([
            // loadHeaderContentPromise,
            loadNavContentPromise,
            loadSubscriptionContentPromise,
            loadFooterContentPromise
        ]);

        // --- 3. Now that elements have content, arrange them in the DOM ---

        // Append subscription section into main
        siteContainer.appendChild(subscriptionSectionElement);

        // Append footer to body (outside site-container)
        bodyElement.appendChild(footerElement);

        // --- 4. Now that DOM is structured and content is loaded, initialize JS functionalities ---
        // inicializa las funcionalidades que dependen de ellos.
        initializeDarkModeToggle();
        // Initialize hamburger menu logic ONLY if on mobile
        if (isMobileDevice()) {
            initializeHamburgerMenu();
        }
        
    } catch (error) {
        console.error("Error durante la carga inicial de componentes o su inicialización:", error);
        // Aquí podrías mostrar un mensaje más amigable al usuario en la página si algo falla críticamente.
    }
});