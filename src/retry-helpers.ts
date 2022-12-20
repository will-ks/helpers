import {
  doWithCancellableTimeout,
  PromiseCancellationToken,
  wait,
} from './timeout-helpers';

type RetryConfig<T> = {
  getShouldRetryOnResult?: (result: T) => boolean;
  getShouldRetryOnError?: (error: unknown) => boolean;
  interval: number;
  maxRetries: number;
  backoff: boolean;
  onRetry?: () => void;
};

type TimeoutConfig = {
  timeout: number;
  timeoutMessage: string;
};

type RetryAndTimeoutConfig<T> = RetryConfig<T> & TimeoutConfig;

export const DEFAULT_RETRY_AND_TIMEOUT_CONFIG: RetryAndTimeoutConfig<unknown> = {
  interval: 500,
  backoff: true,
  maxRetries: 3,
  timeout: 10_000,
  timeoutMessage: 'Timed out before retry condition was met.',
};

const doWithRetries = async <T>(
  action: () => Promise<T>,
  retryConfig: RetryConfig<T>,
  cancellationToken: PromiseCancellationToken,
  nextRetriesLeft?: number,
  nextInterval?: number
): Promise<T> => {
  cancellationToken.checkStateAndThrowIfCancelled();
  const {
    getShouldRetryOnResult,
    maxRetries,
    getShouldRetryOnError,
    backoff,
    onRetry,
  } = retryConfig;
  const interval = nextInterval ?? retryConfig.interval;
  const retriesLeft = nextRetriesLeft ?? maxRetries;
  try {
    const result = await action();
    if (!getShouldRetryOnResult?.(result)) {
      return result;
    }
  } catch (error) {
    if (!getShouldRetryOnError?.(error)) {
      throw error;
    }
  }
  if (retriesLeft === 0) {
    throw new Error('Max retries met');
  }
  onRetry?.();
  await wait(interval);
  return doWithRetries(
    action,
    retryConfig,
    cancellationToken,
    retriesLeft - 1,
    backoff ? interval * 2 : interval
  );
};

export const doWithRetriesAndTimeout = async <T>(
  action: () => Promise<T>,
  retryAndTimeoutConfig: RetryAndTimeoutConfig<
    T
  > = DEFAULT_RETRY_AND_TIMEOUT_CONFIG
) => {
  const { timeout, timeoutMessage } = retryAndTimeoutConfig;
  const actionCancellationToken = new PromiseCancellationToken(
    'Action promise cancelled'
  );
  const timerCancellationToken = new PromiseCancellationToken(
    'Timeout promise cancelled'
  );

  return Promise.race<T>([
    new Promise<T>(async (resolve, reject) => {
      try {
        resolve(
          await doWithRetries(
            action,
            retryAndTimeoutConfig,
            actionCancellationToken
          )
        );
      } catch (error) {
        reject(error);
      } finally {
        timerCancellationToken.cancel();
      }
    }),
    new Promise<T>(async (_resolve, reject) => {
      try {
        await doWithCancellableTimeout(
          () => {
            reject(timeoutMessage);
          },
          timerCancellationToken,
          timeout
        );
      } catch (error) {
        reject(error);
      } finally {
        actionCancellationToken.cancel();
      }
    }),
  ]);
};
