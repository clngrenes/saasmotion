export const MAX_PRODUCT_CONTEXT_CHARS = 12_000;

export function trimProductContext(context: string | undefined): string {
  if (!context) return "";
  return context.slice(0, MAX_PRODUCT_CONTEXT_CHARS);
}
