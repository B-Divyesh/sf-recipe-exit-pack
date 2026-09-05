window.addEventListener('DOMContentLoaded', () => {
  const heading = document.querySelector('h1');
  const announcer = document.querySelector('#route-announcer');
  if (announcer) announcer.textContent = document.title;
  heading?.focus({ preventScroll: true });
});
