document.addEventListener('DOMContentLoaded', () => {
  const fullPath = window.location.pathname + window.location.search;
  window.handleNavigation(fullPath);
});
