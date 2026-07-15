export function getWrappedFocusTarget<T>(
  elements: readonly T[],
  activeElement: T | null,
  backwards: boolean,
): T | null {
  if (elements.length === 0) return null;

  const activeIndex = activeElement ? elements.indexOf(activeElement) : -1;

  if (backwards && activeIndex <= 0) return elements.at(-1) ?? null;
  if (
    !backwards &&
    (activeIndex === -1 || activeIndex === elements.length - 1)
  ) {
    return elements[0] ?? null;
  }

  return null;
}
