// Main entry point for the axios-wrapper library
export {
  AxiosApi,
  ApiService,
  type AxiosApiConfig,
  type ApiResponse,
  type ApiError,
  type ErrorHandler,
  type SuccessHandler,
  type RequestConfig,
  type RequestInterceptor,
  type ResponseInterceptor,
} from "./wrapper";

// Re-export axios types that users might need
export type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

// Version
export const VERSION = "1.0.0";

// Default export
export { AxiosApi as default } from "./wrapper";
