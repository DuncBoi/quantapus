document.addEventListener('DOMContentLoaded', () => {
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      history.replaceState({}, '', redirect);
      window.handleNavigation(redirect); // Now works!
    }
  });
