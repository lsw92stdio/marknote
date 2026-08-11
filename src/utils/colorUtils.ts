/**
 * Helper utilities for dynamic high-contrast theme color calculations
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 37, g: 99, b: 235 }; // fallback blue #2563eb
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Returns an effective accent color that guarantees high contrast against the active theme background.
 * In Dark Mode, if the chosen accent color is too dark (e.g., #020617 or luminance < 65),
 * it automatically adapts to a bright crisp white (#f8fafc).
 */
export function getEffectiveAccentColor(color: string, isDark: boolean): string {
  if (!color) return isDark ? '#f8fafc' : '#020617';
  if (isDark) {
    const lum = getLuminance(color);
    if (lum < 65) {
      return '#f8fafc';
    }
  }
  return color;
}

/**
 * Returns text color ('#000000' or '#ffffff') for optimal legibility on top of the given accent background color.
 */
export function getContrastingTextColor(hexColor: string): '#000000' | '#ffffff' {
  const lum = getLuminance(hexColor);
  return lum > 160 ? '#000000' : '#ffffff';
}

/**
 * Converts an accent hex color into a low-alpha tint suitable as a highlighter background,
 * so the highlight always matches whichever theme accent color is currently selected.
 */
export function getTintedBackground(hex: string, alpha = 0.22): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Darkens a hex color by the given ratio (0-1), used for the favicon's gradient end stop.
 */
export function darkenColor(hex: string, ratio = 0.15): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0');
  return `#${toHex(r * (1 - ratio))}${toHex(g * (1 - ratio))}${toHex(b * (1 - ratio))}`;
}

/**
 * Builds the MarkNote favicon SVG markup for a given accent color, matching MarkNoteLogo's
 * gradient background + M/arrow icon design so the browser tab icon stays in sync with the
 * app's theme color.
 */
export function buildFaviconSvg(accentColor: string): string {
  const gradientEnd = darkenColor(accentColor);
  const iconColor = getContrastingTextColor(accentColor) === '#000000' ? '#000000' : '#ffffff';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${accentColor}"/><stop offset="100%" stop-color="${gradientEnd}"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#g)"/><path d="M6 24V8L13 16L20 8V24" stroke="${iconColor}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M26 12L26 21M26 21L23 18M26 21L29 18" stroke="${iconColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
}
