import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isLoading: boolean;
  userToken: string | null;
  userRole: string | null;
  signIn: (token: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  userRole: null,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const role = await AsyncStorage.getItem('userRole');
        setUserToken(token);
        setUserRole(role);
      } catch (e) {
        console.error('Failed to restore token', e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, role: string) => {
    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('userRole', role);
    setUserToken(token);
    setUserRole(role);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userRole');
    setUserToken(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, userRole, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
