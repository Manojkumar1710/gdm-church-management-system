/**
 * Shared church identity constants.
 * Change the name here and it propagates to every hardcoded occurrence
 * in the frontend (navbar, footer, page titles, admin panel, etc.)
 *
 * NOTE: The name displayed on the *public* About page comes from the
 * backend ChurchInformation API (GET /api/v1/church).  Update that
 * from Admin → Church Information for the About page to reflect the
 * new name.  These constants are only for hardcoded fallback strings.
 */

/** Full church name — used in navbar, footer, hero badge, page title */
export const CHURCH_NAME = 'Bromely Memorial GDM Church';

/** Short name — used in the admin panel sidebar / login where space is tight */
export const CHURCH_NAME_SHORT = 'GDM Church';

/** First line of the two-line navbar brand (tracked caps) */
export const CHURCH_NAME_LINE1 = 'BROMELY MEMORIAL';

/** Second line of the two-line navbar brand (serif) */
export const CHURCH_NAME_LINE2 = 'GDM Church';
