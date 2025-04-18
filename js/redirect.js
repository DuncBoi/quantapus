document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (!redirect) return;

  // Remove the `redirect` param from the URL bar
  params.delete('redirect');
  const base   = window.location.pathname;
  const query  = params.toString();
  const newUrl = base + (query ? `?${query}` : '');
  history.replaceState({}, '', newUrl);

  // Fire your SPA navigation
  window.handleNavigation(redirect);
});
