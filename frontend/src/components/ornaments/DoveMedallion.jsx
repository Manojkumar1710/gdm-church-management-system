/**
 * DoveMedallion — re-exports ChristianDove.
 *
 * All existing usages of DoveMedallion automatically get the new,
 * properly drawn dove without any import changes elsewhere.
 *
 * Props are forwarded unchanged so existing callers (size, className,
 * dark, withCircle) continue to work.
 */
export { default } from './ChristianDove';
