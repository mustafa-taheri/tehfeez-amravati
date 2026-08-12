import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Appbar,
  ActivityIndicator,
  Switch,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function HuffazFormScreen({ navigation, route }: any) {
  const existingHuffaz = route.params?.huffaz;
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(existingHuffaz?.firstName || "");
  const [lastName, setLastName] = useState(existingHuffaz?.lastName || "");
  const [username, setUsername] = useState(existingHuffaz?.username || "");
  const [email, setEmail] = useState(existingHuffaz?.email || "");
  const [mobileNumber, setMobileNumber] = useState(
    existingHuffaz?.mobileNumber || "",
  );
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(existingHuffaz?.isActive ?? true);

  useEffect(() => {
    if (existingHuffaz) {
      setFirstName(existingHuffaz.firstName || "");
      setLastName(existingHuffaz.lastName || "");
      setUsername(existingHuffaz.username || "");
      setEmail(existingHuffaz.email || "");
      setMobileNumber(existingHuffaz.mobileNumber || "");
      setIsActive(existingHuffaz.isActive ?? true);
    }
  }, [existingHuffaz]);

  const saveHuffaz = async () => {
    if (!firstName || !lastName || !username || !mobileNumber) {
      Alert.alert("Validation", "Please fill in the required fields.");
      return;
    }

    setLoading(true);
    try {
      if (existingHuffaz) {
        const response = await apiClient.put(`/huffaz/${existingHuffaz.id}`, {
          firstName,
          lastName,
          email,
          mobileNumber,
          profileImage: null,
          isActive,
        });
        if (response.data.success) {
          navigation.goBack();
        }
      } else {
        const response = await apiClient.post("/huffaz", {
          firstName,
          lastName,
          username,
          password,
          email,
          mobileNumber,
          profileImage: null,
        });
        if (response.data.success) {
          navigation.goBack();
        }
      }
    } catch (error: any) {
      console.error("Failed to save Huffaz", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Could not save Huffaz.",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Huffaz",
      "Are you sure you want to deactivate this Huffaz?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Deactivate",
          style: "destructive",
          onPress: deleteHuffaz,
        },
      ],
    );
  };

  const deleteHuffaz = async () => {
    if (!existingHuffaz) return;
    setLoading(true);
    try {
      const response = await apiClient.delete(`/huffaz/${existingHuffaz.id}`);
      if (response.data.success) {
        navigation.goBack();
      }
    } catch (error: any) {
      console.error("Failed to delete Huffaz", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Could not delete Huffaz.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={existingHuffaz ? "Edit Huffaz" : "Add Huffaz"} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.field}
          mode="outlined"
        />
        <TextInput
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.field}
          mode="outlined"
        />
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.field}
          mode="outlined"
          disabled={!!existingHuffaz}
        />
        {!existingHuffaz && (
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.field}
            secureTextEntry
            mode="outlined"
          />
        )}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.field}
          mode="outlined"
          keyboardType="email-address"
        />
        <TextInput
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          style={styles.field}
          mode="outlined"
          keyboardType="phone-pad"
        />

        {existingHuffaz && (
          <View style={styles.switchRow}>
            <Text>Active</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>
        )}

        <Button
          mode="contained"
          onPress={saveHuffaz}
          loading={loading}
          style={styles.saveButton}
          disabled={loading}
        >
          {existingHuffaz ? "Update Huffaz" : "Create Huffaz"}
        </Button>

        {existingHuffaz && (
          <>
            <Divider style={styles.divider} />
            <Button
              mode="outlined"
              onPress={confirmDelete}
              loading={loading}
              disabled={loading}
              style={styles.deleteButton}
            >
              Deactivate Huffaz
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 14, backgroundColor: "#fff" },
  saveButton: { marginTop: 10, borderRadius: 8 },
  deleteButton: { marginTop: 10, borderRadius: 8 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  divider: { marginVertical: 18 },
});
