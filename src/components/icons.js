// SVG décoratifs autonomes : aucun symbole externe ni police d’icônes.
const paths = {
  "arrow-up-right": '<path d="M6 18 18 6M7 6h11v11"/>',
  location:
    '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  players:
    '<circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M18 13a5 5 0 0 1 3 4v3"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 17h3"/>',
  play: '<path d="m7 4 13 8-13 8Z"/>',
};

export function icon(name) {
  if (!Object.hasOwn(paths, name)) throw new Error(`Icône inconnue : ${name}`);
  const paint =
    name === "play"
      ? 'fill="currentColor"'
      : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="home-icon home-icon--${name}" viewBox="0 0 24 24" ${paint} aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
