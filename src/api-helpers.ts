import pipeNow from '@arrows/composition/pipeNow';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import qs from 'qs';

export class ApiError extends AxiosError {
  axiosError: AxiosError;
  name = 'ApiError';
  isServerProvidedError?: boolean;
  isNetworkError?: boolean;
  isServerError?: boolean;
  statusCode?: number;

  constructor(error: AxiosError) {
    super();
    this.axiosError = error;
    const { response, request, stack, config } = error;
    this.isServerProvidedError = response && true; // client received an error response (5xx, 4xx)
    this.isNetworkError = request && !response; // client never received a response, or request never left
    this.stack = stack;
    this.statusCode = response?.status;
    this.isServerError = this.statusCode ? this.statusCode >= 500 : undefined;
    this.message = `${response?.status || 'Network error'} at ${config?.url ??
      'unknown url'} ${JSON.stringify(this.axiosError)}`;
  }
}

type InternalApiError = ApiError;

export const isApiError = (toCheck: unknown): toCheck is InternalApiError =>
  axios.isAxiosError(toCheck);

export const getApiClient = <T extends Error>({
  apiName,
  config,
  logger,
  transformError,
}: {
  apiName: string;
  config: AxiosRequestConfig;
  logger?: {
    error: (...error: unknown[]) => void;
  };
  transformError?: (error: ApiError) => T;
}): AxiosInstance =>
  pipeNow(
    axios.create({
      timeout: 10_000,
      paramsSerializer: {
        serialize: params => qs.stringify(params, { arrayFormat: 'repeat' }),
      },
      ...config,
    }),
    axios => {
      axios.interceptors.response.use(
        response => response,
        (error: AxiosError) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            logger?.error(
              {
                custom: {
                  status: error.response.status,
                  method: error.response.config?.method?.toUpperCase(),
                  url: error.response.config?.url,
                  body: error.response.data,
                  request: error.config,
                },
              },
              `${apiName} API error response received`
            );
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            logger?.error(
              {
                custom: error.config,
              },
              `${apiName} API error, no response received`
            );
          } else {
            // Something happened in setting up the request that triggered an Error
            logger?.error(
              {
                custom: error,
              },
              `${apiName} API error, error requesting`
            );
          }
          const apiError = new ApiError(error);
          return Promise.reject(
            transformError ? transformError(apiError) : apiError
          );
        }
      );
      return axios;
    }
  );
