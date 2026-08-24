import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  role: string;
  profileImage?: string | null;
};

type AuthContextType = {
  isLoading: boolean;
  userToken: string | null;
  refreshToken: string | null;
  userRole: string | null;
  user: UserProfile | null;
  signIn: (
    token: string,
    refreshToken: string,
    role: string,
    userData?: UserProfile,
  ) => Promise<void>;
  updateUser: (userData: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  refreshToken: null,
  userRole: null,
  user: null,
  signIn: async (
    token: string,
    refreshToken: string,
    role: string,
    userData?: UserProfile,
  ) => {},
  updateUser: async (userData: UserProfile) => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null); // State for refresh token
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const checkStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      console.log("Current AsyncStorage Dump:", Object.fromEntries(result));
    } catch (error) {
      console.error("Error reading AsyncStorage:", error);
    }
  };
  checkStorage();
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const role = await AsyncStorage.getItem("userRole");
        const storedRefreshToken = await AsyncStorage.getItem("refreshToken"); // Read refresh token
        const storedUser = await AsyncStorage.getItem("user");

        setUserToken(token);
        setRefreshToken(storedRefreshToken); // Set refresh token
        setUserRole(role);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {
        console.error("Failed to restore token", e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const signIn = async (
    token: string,
    refreshTokenInput: string,
    role: string,
    userData?: UserProfile,
  ) => {
    await AsyncStorage.setItem("accessToken", token);
    await AsyncStorage.setItem("refreshToken", refreshTokenInput); // Store refresh token
    await AsyncStorage.setItem("userRole", role);
    if (userData) {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    }
    setUserToken(token);
    setRefreshToken(refreshTokenInput);
    setUserRole(role);
    setUser(userData ?? null);
  };

  const updateUser = async (userData: UserProfile) => {
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userRole");
    await AsyncStorage.removeItem("user");
    setUserToken(null);
    setRefreshToken(null);
    setUserRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        refreshToken,
        userRole,
        user,
        signIn,
        updateUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
