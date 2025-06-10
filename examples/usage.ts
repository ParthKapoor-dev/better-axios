import { AxiosApi, ApiService, ApiError, ApiResponse } from "../src";

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

// Example 2: User Service extending ApiService
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

class UserService extends ApiService {
  constructor(api: AxiosApi) {
    super(api, "/users"); // Base path for all user endpoints
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>(""); // GET /users
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.get<User>(`/${id}`); // GET /users/123
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.post<User>("", userData); // POST /users
  }

  async updateUser(
    id: number,
    userData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    return this.put<User>(`/${id}`, userData); // PUT /users/123
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/${id}`); // DELETE /users/123
  }

  // Public endpoints (no auth required)
  async registerUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.post<User>("/register", userData, { useAuth: false });
  }
}

// Example 3: Auth Service
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

class AuthService extends ApiService {
  constructor(api: AxiosApi) {
    super(api, "/auth");
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>("/login", credentials, {
      useAuth: false, // Login doesn't require auth token
    });

    // Set auth token after successful login
    if (response.success) {
      this.api.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.post<void>("/logout");

    // Remove auth token after logout
    if (response.success) {
      this.api.removeAuthToken();
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.post<{ token: string }>("/refresh");
  }
}

// Example 4: Using multiple API clients for different services
const authApiClient = new AxiosApi({
  baseURL: "https://auth.example.com",
  globalErrorHandler: (error: ApiError) => {
    if (error.statusCode === 401) {
      // Handle unauthorized - redirect to login
      console.log("Unauthorized - redirecting to login");
    }
  },
});

const dataApiClient = new AxiosApi({
  baseURL: "https://data.example.com",
  requestInterceptor: (config) => {
    // Add custom headers for data API
    config.headers = {
      ...config.headers,
      "X-Data-Version": "2.0",
    };
    return config;
  },
});

// Example 5: Usage in React component or any application
class Application {
  private userService: UserService;
  private authService: AuthService;

  constructor() {
    this.userService = new UserService(mainApiClient);
    this.authService = new AuthService(mainApiClient);
  }

  async handleLogin(email: string, password: string) {
    try {
      const response = await this.authService.login({ email, password });

      if (response.success) {
        console.log("Login successful:", response.data.user);
        return response.data;
      }
    } catch (error) {
      // Error already handled by global error handler
      // But you can add specific logic here if needed
      console.log("Login failed");
      throw error;
    }
  }

  async loadUsers() {
    try {
      const response = await this.userService.getAllUsers();
      return response.data; // Return users array
    } catch (error) {
      // Handle specific error for this call
      console.log("Failed to load users");
      return [];
    }
  }

  async createUser(userData: CreateUserRequest) {
    try {
      const response = await this.userService.createUser(userData);

      if (response.success) {
        // Custom success handling for this specific call
        console.log("User created successfully:", response.data);
        // showToast('User created successfully!', 'success');
      }

      return response.data;
    } catch (error) {
      // Custom error handling for this specific call
      console.log("Failed to create user");
      // showToast('Failed to create user', 'error');
      throw error;
    }
  }

  // Example with custom error handler
  async deleteUserWithConfirmation(userId: number) {
    try {
      await this.userService.deleteUser(userId, {
        customErrorHandler: (error: ApiError) => {
          if (error.statusCode === 403) {
            console.log("You do not have permission to delete this user");
            // showToast('Permission denied', 'error');
          } else {
            console.log("Failed to delete user:", error.message);
            // showToast('Failed to delete user', 'error');
          }
        },
        customSuccessHandler: () => {
          console.log("User deleted successfully");
          // showToast('User deleted successfully', 'success');
        },
      });
    } catch (error) {
      // Error already handled by custom handler
    }
  }
}

// Example 6: Direct API usage without services
async function directApiUsage() {
  const api = new AxiosApi({
    baseURL: "https://api.example.com",
    globalErrorHandler: (error) => console.error(error.message),
  });

  // Set auth token
  api.setAuthToken("your-jwt-token");

  try {
    // Direct API calls
    const response = await api.get<User[]>("/users");
    console.log("Users:", response.data);

    const newUser = await api.post<User>("/users", {
      name: "John Doe",
      email: "john@example.com",
    });
    console.log("New user:", newUser.data);
  } catch (error) {
    console.log("Request failed");
  }
}
