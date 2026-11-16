/**
 * Light and dark themes. With no stored choice the page follows the reader's
 * system setting through CSS alone; a stored choice sets `data-theme` on
 * `<html>`, which the token blocks in global.css read.
 */

export type Theme = 'light' | 'dark';

/** The one `localStorage` entry the site keeps. */
export const THEME_STORAGE_KEY = 'theme';

/** Set on `<html>` when the reader has made a choice. */
export const THEME_ATTRIBUTE = 'data-theme';

/** A stored or attribute value as a theme, or null for anything else. */
export function parseStoredTheme(raw: unknown): Theme | null {
  return raw === 'light' || raw === 'dark' ? raw : null;
}

/** The theme to show: the reader's choice if there is one, else the system's. */
export function resolveTheme(stored: Theme | null, systemPrefersDark: boolean): Theme {
  return stored ?? (systemPrefersDark ? 'dark' : 'light');
}

export function otherTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/** The subset of `Storage` used here, so tests can pass a stub. */
export type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** The stored choice, or null if there is none or storage is blocked. */
export function readStoredTheme(getStorage: () => ThemeStorage): Theme | null {
  try {
    return parseStoredTheme(getStorage().getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Store the choice. Returns false if storage is blocked. */
export function writeStoredTheme(getStorage: () => ThemeStorage, theme: Theme): boolean {
  try {
    getStorage().setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
