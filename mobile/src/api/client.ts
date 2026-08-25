import axios, { AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Priority: Expo extra config -> environment variable -> emulator defaults -> developer must set LAN IP for physical device
const expoApiUrl =
  (Constants?.expoConfig as any)?.extra?.API_URL ||
  process.env.EXPO_PUBLIC_API_URL;

let API_URL = expoApiUrl;
if (!API_URL) {
  if (Platform.OS === "android" && !Constants.isDevice) {
    // Android emulator
    API_URL = "http://10.0.2.2:5000/api/v1";
  } else if (Platform.OS === "ios" && !Constants.isDevice) {
    // iOS simulator
    API_URL = "http://localhost:5000/api/v1";
  } else {
    // Physical device: replace with your computer's LAN IP, e.g. 'http://192.168.1.100:5000/api/v1'
    API_URL = "http://192.168.1.115:5000/api/v1";
  }
}

console.log("API_URL:", API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config: AxiosRequestConfig | any) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token && config && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle token expiration (401 errors)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("originalRequest ==> ", originalRequest);

    // Check if error is 401 and the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        console.log("isRefreshing ==> ", isRefreshing);

        // Queue the request while waiting for the new token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        // Call your backend refresh endpoint
        // NOTE: Use a clean axios instance to avoid infinite 401 loops
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        console.log("response ==> ", response.data);

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: userData,
        } = response.data;

        // Save new tokens to storage
        await AsyncStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          await AsyncStorage.setItem("refreshToken", newRefreshToken);
        }
        if (userData) {
          await AsyncStorage.setItem("userRole", userData?.role);
          await AsyncStorage.setItem("user", JSON.stringify(userData));
        }

        // Update auth header for the current failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process any other requests that were waiting in the queue
        processQueue(null, newAccessToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log("refreshError ==> ", refreshError);

        // Refresh token failed or expired -> log out the user
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove([
          "accessToken",
          "refreshToken",
          "user",
          "userRole",
        ]);

        // Proactively reject so the UI can handle redirection to Login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
