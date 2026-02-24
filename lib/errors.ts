export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toAppError(e: unknown): AppError {
  if (e instanceof AppError) return e;
  if (e instanceof Error) return new AppError(e.message, 500);
  return new AppError(String(e), 500);
}
