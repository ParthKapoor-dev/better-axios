# Axios API Wrapper

A powerful TypeScript axios wrapper that eliminates repetitive API call patterns, provides centralized error handling, and simplifies authentication management.

## 🚀 Features

- **Zero Overhead**: No performance impact on your API calls
- **Centralized Error Handling**: Handle errors globally or per request
- **Automatic Authentication**: Built-in auth token management
- **Type Safety**: Full TypeScript support with generics
- **Service Pattern**: Organized API calls with base service class
- **Multiple Clients**: Support for different backend services
- **Custom Interceptors**: Request/response interceptors support
- **CLI Tool**: Generate boilerplate code quickly

## 📦 Installation

```bash
npm install axios-api-wrapper-cli
# or
yarn add axios-api-wrapper-cli
```

## 🛠️ CLI Usage

### Initialize a new project
```bash
npx better-axios init
# or
npx better-axios init --name my-project --examples --framework react
```

### Generate service files
```bash
# Generate a new service
npx better-axios generate service --name user --path /users

# Generate a new API client
npx better-axios generate client --name payment

# Generate configuration file
npx better-axios generate config
```

## 💻 Quick Start

### 1. Basic Setup

```typescript
import { AxiosApi } from 'axios-api-wrapper-cli';

const apiClient = new AxiosApi({
  baseURL: 'https://api.example.com',
  globalErrorHandler: (error) => {
    console.error('API Error:', error.message);
    // Show toast notification, etc.
  }
});
```

### 2. Create a Service

```typescript
import { ApiService } from 'axios-api-wrapper-cli';

interface User {
  id: number;
  name: string;
  email: string;
}

class UserService extends ApiService {
  constructor(api: AxiosApi) {
    super(api, '/users');
  }

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('');
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.get<User>(`/${id}`);
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.post<User>('', userData);
  }
}

const userService = new UserService(apiClient);
```

### 3. Use in Your Application

```typescript
// Simple usage
async function loadUsers() {
  try {
    const response = await userService.getAllUsers();
    if (response.success) {
      return response.data; // User[]
    }
  } catch (error) {
    // Error already handled by global handler
    return [];
  }
}

// With authentication
apiClient.setAuthToken('your-jwt-token');
await userService.createUser({ name: 'John', email: 'john@example.com' });
```

## 🔧 Configuration Options

```typescript
const apiClient = new AxiosApi({
  baseURL: 'https://api.example.com',
  timeout: 15000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  authTokenKey: 'Authorization', // Header key for auth token
  authTokenPrefix: 'Bearer ', // Token prefix
  globalErrorHandler: (error: ApiError) => {
    // Handle all errors globally
    switch (error.statusCode) {
      case 401:
        // Redirect to login
        break;
      case 403:
        // Show permission error
        break;
      default:
        // Show generic error
    }
  },
  globalSuccessHandler: (response: ApiResponse) => {
    // Optional global success handling
    console.log('Request successful');
  },
  requestInterceptor: (config) => {
    // Modify requests before sending
    config.headers['X-Custom-Header'] = 'value';
    return config;
  },
  responseInterceptor: (response) => {
    // Process responses before handling
    return response;
  }
});
```

## 🔐 Authentication

```typescript
// Set auth token (automatically added to all requests)
apiClient.setAuthToken('your-jwt-token');

// Remove auth token
apiClient.removeAuthToken();

// Skip auth for specific requests
await apiClient.get('/public-endpoint', { useAuth: false });
```

## 🎯 Advanced Usage

### Custom Error Handling per Request

```typescript
await userService.deleteUser(123, {
  customErrorHandler: (error) => {
    if (error.statusCode === 403) {
      alert('Permission denied');
    } else {
      alert('Delete failed');
    }
  },
  customSuccessHandler: () => {
    alert('User deleted successfully');
  }
});
```

### Multiple API Clients

```typescript
const mainApiClient = new AxiosApi({
  baseURL: 'https://api.example.com',
  globalErrorHandler: handleMainApiError
});

const paymentApiClient = new AxiosApi({
  baseURL: 'https://payments.example.com',
  globalErrorHandler: handlePaymentApiError
});

const userService = new UserService(mainApiClient);
const paymentService = new PaymentService(paymentApiClient);
```

### Direct API Calls

```typescript
// Without services
const response = await apiClient.get<User[]>('/users');
const newUser = await apiClient.post<User>('/users', userData);
const updatedUser = await apiClient.put<User>(`/users/${id}`, updateData);
await apiClient.delete(`/users/${id}`);
```

## 📚 API Reference

### AxiosApi Class

#### Constructor Options
- `baseURL`: Base URL for all requests
- `timeout`: Request timeout in milliseconds
- `defaultHeaders`: Default headers for all requests
- `authTokenKey`: Header key for authentication token
- `authTokenPrefix`: Prefix for authentication token
- `globalErrorHandler`: Global error handling function
- `globalSuccessHandler`: Global success handling function
- `requestInterceptor`: Custom request interceptor
- `responseInterceptor`: Custom response interceptor

#### Methods
- `get<T>(url, config?)`: GET request
- `post<T>(url, data?, config?)`: POST request
- `put<T>(url, data?, config?)`: PUT request
- `patch<T>(url, data?, config?)`: PATCH request
- `delete<T>(url, config?)`: DELETE request
- `setAuthToken(token)`: Set authentication token
- `removeAuthToken()`: Remove authentication token
- `setDefaultHeader(key, value)`: Set default header
- `removeDefaultHeader(key)`: Remove default header

### ApiService Class

Base class for creating organized API services.

#### Constructor
```typescript
constructor(api: AxiosApi, basePath: string)
```

#### Protected Methods
- `get<T>(endpoint, config?)`: GET request relative to basePath
- `post<T>(endpoint, data?, config?)`: POST request relative to basePath
- `put<T>(endpoint, data?, config?)`: PUT request relative to basePath
- `patch<T>(endpoint, data?, config?)`: PATCH request relative to basePath
- `delete<T>(endpoint, config?)`: DELETE request relative to basePath
- `buildUrl(endpoint)`: Build full URL from endpoint

### Request Configuration

```typescript
interface RequestConfig {
  useAuth?: boolean; // Include auth token (default: true)
  customErrorHandler?: (error: ApiError) => void;
  customSuccessHandler?: (response: ApiResponse) => void;
  skipGlobalHandlers?: boolean; // Skip global handlers
  // ... other axios config options
}
```

### Response Types

```typescript
interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  statusCode: number;
}

interface ApiError {
  message: string;
  statusCode: number;
  originalError: any;
}
```

## 🔍 Examples

Check out the `/examples` directory in your generated project for complete usage examples including:

- React integration
- Vue integration
- Node.js server usage
- Authentication flows
- Error handling patterns
- Multiple API clients

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help, please:

1. Check the [documentation](https://github.com/yourusername/axios-api-wrapper-cli)
2. Open an [issue](https://github.com/yourusername/axios-api-wrapper-cli/issues)
3. Start a [discussion](https://github.com/yourusername/axios-api-wrapper-cli/discussions)

---

Made with ❤️ by [Your Name]
