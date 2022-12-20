export const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const doWithCancellableTimeout = async (
  onTimeout: () => void,
  cancellationToken: PromiseCancellationToken,
  timeout: number,
  nextInterval = 0
): Promise<void> => {
  cancellationToken.checkStateAndThrowIfCancelled();
  if (nextInterval >= timeout) {
    return onTimeout();
  }
  await wait(1_000);
  return doWithCancellableTimeout(
    onTimeout,
    cancellationToken,
    timeout,
    nextInterval - 1_000
  );
};

export class PromiseCancellationToken {
  private cancelled = false;
  private readonly message: string;

  constructor(message?: string) {
    this.message = message || 'PromiseCancellationToken cancelled';
  }

  checkStateAndThrowIfCancelled() {
    if (this.isCancelled()) {
      throw new Error(this.message);
    }
  }

  isCancelled() {
    return this.cancelled;
  }

  cancel() {
    this.cancelled = true;
  }
}
