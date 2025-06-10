import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

// Type definitions
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  statusCode: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  originalError: any;
}

export type ErrorHandler = (error: ApiError) => void;
export type SuccessHandler<T = any> = (response: ApiResponse<T>) => void;
export type RequestInterceptor = (
  config: AxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
export type ResponseInterceptor = (
  response: AxiosResponse,
) => AxiosResponse | Promise<AxiosResponse>;

export interface AxiosApiConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  authTokenKey?: string; // Key for auth token in headers (default: 'Authorization')
  authTokenPrefix?: string; // Prefix for auth token (default: 'Bearer ')
  globalErrorHandler?: ErrorHandler;
  globalSuccessHandler?: SuccessHandler;
  requestInterceptor?: RequestInterceptor;
  responseInterceptor?: ResponseInterceptor;
}

export interface RequestConfig
  extends Omit<AxiosRequestConfig, "url" | "method"> {
  useAuth?: boolean;
  customErrorHandler?: ErrorHandler;
  customSuccessHandler?: SuccessHandler;
  skipGlobalHandlers?: boolean;
}

export class AxiosApi {
  private axiosInstance: AxiosInstance;
  private config: AxiosApiConfig;
  private authToken: string | null = null;

  constructor(config: AxiosApiConfig) {
    this.config = {
      timeout: 10000,
      authTokenKey: "Authorization",
      authTokenPrefix: "Bearer ",
      ...config,
    };

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.defaultHeaders || {},
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add auth token if available and useAuth is not explicitly false
        if (this.authToken && config.headers) {
          config.headers[this.config.authTokenKey!] =
            `${this.config.authTokenPrefix}${this.authToken}`;
        }

        // Apply custom request interceptor if provided
        if (this.config.requestInterceptor) {
          config = await this.config.requestInterceptor(config);
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      async (response) => {
        // Apply custom response interceptor if provided
        if (this.config.responseInterceptor) {
          response = await this.config.responseInterceptor(response);
        }
        return response;
      },
      (error) => Promise.reject(error),
    );
  }

  // Auth token management
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  removeAuthToken(): void {
    this.authToken = null;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // Core request method
  private async makeRequest<T = any>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    url: string,
    requestConfig: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const {
      useAuth = true,
      customErrorHandler,
      customSuccessHandler,
      skipGlobalHandlers = false,
      ...axiosConfig
    } = requestConfig;

    try {
      // Prepare axios config
      const config: AxiosRequestConfig = {
        method,
        url,
        ...axiosConfig,
      };

      // Override auth header if useAuth is explicitly false
      if (!useAuth && config.headers) {
        delete config.headers[this.config.authTokenKey!];
      }

      const response = await this.axiosInstance.request<T>(config);

      const apiResponse: ApiResponse<T> = {
        data: response.data,
        success: true,
        statusCode: response.status,
        message: response.statusText,
      };

      // Handle success
      if (!skipGlobalHandlers) {
        if (customSuccessHandler) {
          customSuccessHandler(apiResponse);
        } else if (this.config.globalSuccessHandler) {
          this.config.globalSuccessHandler(apiResponse);
        }
      }

      return apiResponse;
    } catch (error) {
      const apiError = this.createApiError(error);

      // Handle error
      if (!skipGlobalHandlers) {
        if (customErrorHandler) {
          customErrorHandler(apiError);
        } else if (this.config.globalErrorHandler) {
          this.config.globalErrorHandler(apiError);
        }
      }

      throw apiError;
    }
  }

  private createApiError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as any;
      return {
        message:
          responseData?.message || axiosError.message || "Request failed",
        statusCode: axiosError.response?.status || 0,
        originalError: axiosError,
      };
    } else {
      return {
        message: error.message || "Unknown error occurred",
        statusCode: 0,
        originalError: error,
      };
    }
  }

  // HTTP Methods
  async get<T = any>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("GET", url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("POST", url, { ...config, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("PUT", url, { ...config, data });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("PATCH", url, { ...config, data });
  }

  async delete<T = any>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>("DELETE", url, config);
  }

  // Utility methods
  setDefaultHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
    this.config.baseURL = baseURL;
  }

  // Get the underlying axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Base Service class for creating specific API services
export abstract class ApiService {
  protected api: AxiosApi;
  protected basePath: string;

  constructor(api: AxiosApi, basePath: string = "") {
    this.api = api;
    this.basePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
  }

  protected buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${this.basePath}/${cleanEndpoint}`.replace(/\/+/g, "/");
  }

  // Convenience methods for services
  protected async get<T = any>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.api.get<T>(this.buildUrl(endpoint), config);
  }

  protected async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.api.post<T>(this.buildUrl(endpoint), data, config);
  }

  protected async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.api.put<T>(this.buildUrl(endpoint), data, config);
  }

  protected async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.api.patch<T>(this.buildUrl(endpoint), data, config);
  }

  protected async delete<T = any>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.api.delete<T>(this.buildUrl(endpoint), config);
  }
}
