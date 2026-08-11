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
