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
    const mainNav = document.querySelector('nav.main-nav');
    const NAV_OPEN_CLASS = 'is-open'; // Class to toggle on nav

    if (hamburgerIcon && mainNav) {
        hamburgerIcon.addEventListener('click', () => {
            mainNav.classList.toggle(NAV_OPEN_CLASS);
            // console.log('hamburger click');
            // Optional: Change hamburger icon to close icon
            // hamburgerIcon.textContent = mainNav.classList.contains(NAV_OPEN_CLASS) ? '✕' : '☰';
        });
    } else {
        console.warn("Hamburger menu icon or main navigation not found. Hamburger menu functionality not initialized.");
    }
}

/**
 * @brief Initializes the language switcher functionality.
 */
function initializeLanguageSwitcher() {
    const LANG_KEY = 'selectedLanguage';
    const DEFAULT_LANG = 'es';
    const DEFAULT_FLAG = '🇪🇸';

    const switchers = document.querySelectorAll('.language-switcher');

    switchers.forEach(switcher => {
        const currentLangFlagElement = switcher.querySelector('.current-lang-flag');
        const langDropdownElement = switcher.querySelector('.lang-dropdown');

        if (!currentLangFlagElement || !langDropdownElement) {
            console.warn("Language switcher elements not found in one of the switchers.");
            return;
        }

        // Toggle dropdown visibility
        currentLangFlagElement.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que el click se propague al document
            const isVisible = langDropdownElement.classList.toggle('visible');
            currentLangFlagElement.setAttribute('aria-expanded', isVisible.toString());
        });

        // Handle language selection
        langDropdownElement.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                const selectedLang = event.target.dataset.lang;
                const selectedFlag = event.target.dataset.flag;

                currentLangFlagElement.textContent = selectedFlag;
                localStorage.setItem(LANG_KEY, selectedLang);
                langDropdownElement.classList.remove('visible');
                currentLangFlagElement.setAttribute('aria-expanded', 'false');
                // Aquí llamarías a una función para cambiar el contenido del sitio:
                // changeSiteLanguage(selectedLang);
                console.log(`Idioma seleccionado: ${selectedLang}`);
            }
        });
    });

    // Set initial language from localStorage or default
    const savedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
    // Find the corresponding flag for the saved language to set it initially
    // This part assumes all switchers should show the same initial language.
    const initialLangOption = document.querySelector(`.lang-dropdown li[data-lang="${savedLang}"]`);
    const initialFlag = initialLangOption ? initialLangOption.dataset.flag : DEFAULT_FLAG;

    document.querySelectorAll('.current-lang-flag').forEach(el => el.textContent = initialFlag);
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

        // --- 1. Create all structural elements ---
        const headerElement = document.createElement('header');
        const navElement = document.createElement('nav');
        navElement.classList.add('main-nav'); // Importante para que los estilos CSS apliquen
        const subscriptionSectionElement = document.createElement('section');
        subscriptionSectionElement.classList.add('subscription-section');
        const footerElement = document.createElement('footer');

        // --- 2. Load content into these elements in parallel ---
        const navUrl = isMobileDevice() ? '/complements/nav-mobile.html' : '/complements/nav-regular.html';
        // const loadHeaderContentPromise = cargarComponente(headerUrl, headerElement);
        const loadNavContentPromise = cargarComponente(navUrl, navElement);
        const loadSubscriptionContentPromise = cargarComponente('/complements/subscription-section.html', subscriptionSectionElement);
        const loadFooterContentPromise = cargarComponente('/complements/footer.html', footerElement);


        // Wait for all content to be loaded
        await Promise.all([
            // loadHeaderContentPromise,
            loadNavContentPromise,
            loadSubscriptionContentPromise,
            loadFooterContentPromise
        ]);

        // --- 3. Now that elements have content, arrange them in the DOM ---

        // Append subscription section into main
        mainElement.appendChild(subscriptionSectionElement);

        // Append footer to body (outside site-container)
        bodyElement.appendChild(footerElement);

        // Arrange header and nav based on device
        // if (isMobileDevice()) {
        //     // Mobile: header -> (nav inside header) -> main
        //     siteContainer.insertBefore(headerElement, mainElement);
        //     headerElement.appendChild(navElement); // Nav is inside header
        // } else {
        //     // Regular: header -> nav -> main
        //     siteContainer.insertBefore(navElement, mainElement); // Nav before main
        //     siteContainer.insertBefore(headerElement, navElement); // Header before nav
        // }

        // --- 4. Now that DOM is structured and content is loaded, initialize JS functionalities ---
        // inicializa las funcionalidades que dependen de ellos.
        initializeDarkModeToggle();
        // Si tuvieras una función para el menú hamburguesa, la llamarías aquí también:
        // initializeHamburgerMenu();
        // Initialize hamburger menu logic ONLY if on mobile
        if (isMobileDevice()) {
            initializeHamburgerMenu();
        }
        initializeLanguageSwitcher(); // Inicializar el selector de idioma
    } catch (error) {
        console.error("Error durante la carga inicial de componentes o su inicialización:", error);
        // Aquí podrías mostrar un mensaje más amigable al usuario en la página si algo falla críticamente.
    }
});