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

export default apiClient;
