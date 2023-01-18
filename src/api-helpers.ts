import pipeNow from '@arrows/composition/pipeNow';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import qs from 'qs';

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
  transformError?: (error: AxiosError) => T;
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
          return Promise.reject(transformError ? transformError(error) : error);
        }
      );
      return axios;
    }
  );
