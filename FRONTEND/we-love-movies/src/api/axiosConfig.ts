import axios, { 
  AxiosInstance, 
  AxiosError,  
  InternalAxiosRequestConfig 
} from 'axios';


interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: QueueItem[] = [];

  
  private constructor() {
    this.api = axios.create({
      baseURL: apiBaseUrl|| 'http://localhost:3000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For cookies
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private processQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
      
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (token && originalRequest) {
                  originalRequest.headers.Authorization = `Bearer ${token as string}`;
                  return this.api(originalRequest);
                }
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const response = await this.api.post<{ accessToken: string }>('/auth/refresh');
            const { accessToken } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            
            this.processQueue(null, accessToken);
            return this.api(originalRequest);

          } catch (refreshError) {
            this.processQueue(refreshError as Error, null);
            localStorage.removeItem('accessToken');
            window.location.href = '/auth';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config = {}) {
    return this.api.get<T>(url, config);
  }

  public post<T>(url: string, data = {}, config = {}) {
    return this.api.post<T>(url, data, config);
  }

  public put<T>(url: string, data = {}, config = {}) {
    return this.api.put<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.api.delete<T>(url, config);
  }

  public patch<T>(url: string, config = {}) {
    return this.api.patch<T>(url, config);
  }
}

export const api = ApiClient.getInstance();