/**
 * Kept apart from theme.ts so the toggle's client bundle doesn't carry this
 * string.
 */
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from './theme';

/**
 * The blocking script in `<head>`: applies a stored choice before first paint.
 * It does the same as `readStoredTheme` in theme.ts (tests run it against stubs). With no
 * valid choice it does nothing and CSS follows the system setting.
 */
export const themeHeadScript =
  `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});` +
  `if(t==="light"||t==="dark")document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},t)}catch(e){}})();`;
