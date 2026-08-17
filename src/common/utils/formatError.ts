// Node throws AggregateError (empty top-level .message) when a host resolves
// to multiple addresses and all connection attempts fail — e.g. Postgres
// being unreachable on both ::1 and 127.0.0.1. Unwrap it so logs stay useful.
export function formatError(error: unknown): string {
  if (error instanceof AggregateError) {
    const nested = error.errors.map((e) => formatError(e));
    return [error.message, ...nested].filter(Boolean).join('; ') || error.name;
  }
  if (error instanceof Error) {
    return error.message || error.name;
  }
  return String(error);
}
