import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  TextInput,
  Button,
  Appbar,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function ChangePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Validation", "Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Validation",
        "New password and confirm password do not match.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/change-password", {
        oldPassword: currentPassword,
        newPassword,
      });

      if (response.data.success) {
        Alert.alert("Success", "Password updated successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        setError(response.data.message || "Unable to update password.");
      }
    } catch (updateError: any) {
      console.error(
        "ChangePassword error:",
        updateError?.response?.data?.message,
      );
      setError(
        updateError.response?.data?.message || "Unable to update password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header mode="small" style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Change Password" />
      </Appbar.Header>
      <View style={styles.container}>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          mode="outlined"
          style={styles.field}
        />
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          mode="outlined"
          style={styles.field}
        />
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          mode="outlined"
          style={styles.field}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          Update Password
        </Button>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { flex: 1, padding: 20, paddingTop: 24 },
  field: { marginBottom: 16, backgroundColor: "#fff" },
  saveButton: { marginTop: 8, borderRadius: 8 },
  errorText: { color: "#D32F2F", marginTop: 16, textAlign: "center" },
});
