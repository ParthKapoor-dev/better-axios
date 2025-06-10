import { AxiosApi, ApiError, ApiResponse } from "../src";

// Example 1: Basic Setup with Global Error Handling
const mainApiClient = new AxiosApi({
  baseURL: "https://api.example.com",
  timeout: 15000,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
  globalErrorHandler: (error: ApiError) => {
    // Global error handling - show toast, log, etc.
    console.error("API Error:", error.message);
    // showToast(error.message, 'error');
  },
  globalSuccessHandler: (response: ApiResponse) => {
    // Optional global success handling
    console.log("API Success:", response.statusCode);
  },
});
