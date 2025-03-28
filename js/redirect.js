document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
          
    if (redirect) {
        // Force a hard navigation
        window.location.replace(redirect);
    } else {
        // Initialize normal SPA routing
        if (window.handleNavigation) {
            window.handleNavigation(window.location.pathname);
        }
    }
});
