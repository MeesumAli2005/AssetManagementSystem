// `err` in a catch block is `unknown` under strict mode — this is the one
// place that narrows it, instead of every catch block doing its own check.
export function getErrorMessage(
  err: unknown,
  fallback: string,
): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
