/**
 * Bidirectional mapping between letter sizes and number sizes.
 * The 5 standard pairs: S↔54, M↔56, L↔58, XL↔60, XXL↔62.
 *
 * Used by the size selector to highlight both rows simultaneously, and by
 * order/WhatsApp formatting so the customer's selection is preserved as
 * "Letter / Number" (e.g. "M / 56") wherever the order is displayed.
 */

const LETTER_TO_NUMBER: Record<string, string> = {
  S: "54",
  M: "56",
  L: "58",
  XL: "60",
  XXL: "62",
};

const NUMBER_TO_LETTER: Record<string, string> = Object.fromEntries(
  Object.entries(LETTER_TO_NUMBER).map(([k, v]) => [v, k])
);

const LETTER_SIZES = new Set(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]);
const NUMBER_PATTERN = /^\d{2,3}$/;

/** Returns the paired size for a given size, or null if no pair exists. */
export function getMappedSize(size: string): string | null {
  return LETTER_TO_NUMBER[size] ?? NUMBER_TO_LETTER[size] ?? null;
}

/** True if `size` is a known letter size (XS..XXXL). */
export function isLetterSize(size: string): boolean {
  return LETTER_SIZES.has(size);
}

/** True if `size` looks like a numeric size (2-3 digits). */
export function isNumberSize(size: string): boolean {
  return NUMBER_PATTERN.test(size);
}

/**
 * Format a size for display — if a mapping exists, returns "Letter / Number".
 * Otherwise returns the size unchanged.
 * Used for WhatsApp messages, order rows, etc.
 */
export function formatSizeWithPair(size: string): string {
  if (!size) return "";
  const mapped = getMappedSize(size);
  if (!mapped) return size;
  // Always letter first, then number (consistent ordering regardless of which the user clicked)
  if (isLetterSize(size)) return `${size} / ${mapped}`;
  return `${mapped} / ${size}`;
}

/**
 * Split a product's sizes array into three groups for the two-row selector:
 *  - letterRow: XS, S, M, L, XL, XXL, XXXL
 *  - numberRow: 52, 54, 56, 58, 60, 62, 64, etc.
 *  - others:    Any size that doesn't match either (e.g. "One Size")
 * Each group preserves the original order from the input.
 */
export function splitSizesIntoRows(sizes: string[]): {
  letterRow: string[];
  numberRow: string[];
  others: string[];
} {
  const letterRow: string[] = [];
  const numberRow: string[] = [];
  const others: string[] = [];
  for (const s of sizes) {
    if (isLetterSize(s)) letterRow.push(s);
    else if (isNumberSize(s)) numberRow.push(s);
    else others.push(s);
  }
  return { letterRow, numberRow, others };
}
