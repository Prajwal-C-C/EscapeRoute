const CONNECTION_ERROR_PATTERN = /P1001|P1002|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EHOSTUNREACH|Can't reach database server|connection terminated unexpectedly/i;

export function isDatabaseConnectionError(error: unknown) {
  const candidate = error as { code?: string; errorCode?: string; message?: string };
  const details = `${candidate?.code || ""} ${candidate?.errorCode || ""} ${candidate?.message || ""}`;
  return CONNECTION_ERROR_PATTERN.test(details);
}

export function getDatabaseFailure(error: unknown, fallback: string) {
  if (isDatabaseConnectionError(error)) {
    return {
      status: 503,
      message: "Database unavailable. Check the server's network access to PostgreSQL and confirm the Neon project is active.",
    };
  }

  return { status: 500, message: fallback };
}
