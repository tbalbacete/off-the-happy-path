/**
 * The share links' icons: the inside of a 24×24 SVG, drawn in
 * `currentColor`. X and Bluesky are their official marks (paths from Simple
 * Icons, CC0; the marks belong to their owners). LinkedIn's mark isn't
 * published there, so it's an "in" knocked out of a square, and email is an
 * envelope in lines. Square corners throughout, per plan §6.
 */
import type { ShareNetwork } from './share';

export const shareIcons: Record<ShareNetwork, string> = {
  email:
    '<path d="M2 5h20v14H2z" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M2 6l10 7 10-7" fill="none" stroke="currentColor" stroke-width="2"/>',
  linkedin:
    '<path fill="currentColor" fill-rule="evenodd" d="M1 1h22v22H1z' +
    'M5 4.5h3.2v3.2H5z' +
    'M5 9.5h3.2V19H5z' +
    'M10.5 9.5h3.1v1.4c.5-.9 1.6-1.7 3.2-1.7 2.5 0 3.7 1.6 3.7 4.3V19h-3.2v-5c0-1.4-.5-2.3-1.7-2.3-1.3 0-2 .9-2 2.3v5h-3.1z"/>',
  bluesky:
    '<path fill="currentColor" d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/>',
  x: '<path fill="currentColor" d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>',
};
