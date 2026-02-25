export const MODULE_COLOR_NAMES = [
  'blue', 'emerald', 'amber', 'red', 'violet', 'cyan', 'orange', 'pink',
] as const;

export type NodeColor = typeof MODULE_COLOR_NAMES[number] | 'none';

/** Tailwind arbitrary property classes — set --node-color on the element */
export const NODE_COLOR_CLASS: Record<NodeColor, string> = {
  blue:    '[--node-color:var(--module-color-1)]',
  emerald: '[--node-color:var(--module-color-2)]',
  amber:   '[--node-color:var(--module-color-3)]',
  red:     '[--node-color:var(--module-color-4)]',
  violet:  '[--node-color:var(--module-color-5)]',
  cyan:    '[--node-color:var(--module-color-6)]',
  orange:  '[--node-color:var(--module-color-7)]',
  pink:    '[--node-color:var(--module-color-8)]',
  none:    '[--node-color:var(--module-color-none)]',
};

/** CSS var() references for SVG/MiniMap contexts */
export const NODE_COLOR_VAR: Record<NodeColor, string> = {
  blue:    'var(--module-color-1)',
  emerald: 'var(--module-color-2)',
  amber:   'var(--module-color-3)',
  red:     'var(--module-color-4)',
  violet:  'var(--module-color-5)',
  cyan:    'var(--module-color-6)',
  orange:  'var(--module-color-7)',
  pink:    'var(--module-color-8)',
  none:    'var(--module-color-none)',
};
