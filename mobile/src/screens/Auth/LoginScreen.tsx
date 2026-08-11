import React, { useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Title, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });

      if (response.data.success) {
        const { user, tokens } = response.data.data;
        await signIn(tokens.accessToken, user.role, user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Quran Tehfeez Management</Title>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Login
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});
