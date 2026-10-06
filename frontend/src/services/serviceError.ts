/**
 * An error whose message is safe to show to the user.
 * Services throw this so raw Google / HTTP messages never reach the UI.
 */
export class ServiceError extends Error {
  readonly cause?: unknown

  constructor(userMessage: string, cause?: unknown) {
    super(userMessage)
    this.name = 'ServiceError'
    this.cause = cause
  }
}

/** Turns any thrown value into a message we are happy to show. */
export function toUserMessage(error: unknown, fallback: string): string {
  return error instanceof ServiceError ? error.message : fallback
}
