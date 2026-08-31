import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import {
  Appbar,
  Button,
  TextInput,
  Text,
  Switch,
  HelperText,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { validateDDMMYYYY } from "../../utils/dateValidation";

export default function AcademicPeriodFormScreen({ route, navigation }: any) {
  const period = route.params?.period;
  const isEditing = !!period;

  const [name, setName] = useState(
    period ? period.name.replace("-Academic-Year", "") : "",
  );
  const [startDate, setStartDate] = useState(
    period?.startDate
      ? new Date(period.startDate)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "",
  );
  const [endDate, setEndDate] = useState(
    period?.endDate
      ? new Date(period.endDate).toLocaleDateString("en-GB").replace(/\//g, "-")
      : "",
  );
  const [isCurrent, setIsCurrent] = useState(period ? period.isCurrent : false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name || !startDate || !endDate) {
      setError("Please fill all required fields.");
      return;
    }
    if (!validateDDMMYYYY(startDate) || !validateDDMMYYYY(endDate)) {
      setError("Please enter dates in DD-MM-YYYY format.");
      return;
    }

    setError(null);
    setLoading(true);

    const payload = {
      name,
      startDate: startDate.split("-").reverse().join("-"),
      endDate: endDate.split("-").reverse().join("-"),
      isCurrent,
    };

    try {
      let response;
      if (isEditing) {
        response = await apiClient.put(
          `/academic-months/period/${period.id}`,
          payload,
        );
      } else {
        response = await apiClient.post(
          "/academic-months/period/create",
          payload,
        );
      }

      if (response.data.success) {
        Alert.alert(
          "Success",
          `Academic Period ${isEditing ? "updated" : "created"} successfully!`,
        );
        navigation.goBack();
      } else {
        setError(response.data.message || "Failed to save.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header
        mode="small"
        statusBarHeight={0}
        style={[styles.appBar, { height: 60 }]}
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={isEditing ? "Edit Academic Period" : "New Academic Period"}
        />
      </Appbar.Header>

      <View style={styles.container}>
        {error && (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        )}

        <TextInput
          label="Name (e.g. 2024-2025) *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Start Date (DD-MM-YYYY) *"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="DD-MM-YYYY"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="End Date (DD-MM-YYYY) *"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="DD-MM-YYYY"
          mode="outlined"
          style={styles.input}
        />

        {isEditing && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Mark as Current Period</Text>
            <Switch value={isCurrent} onValueChange={setIsCurrent} />
          </View>
        )}
        {isEditing && (
          <HelperText type="info" visible={true}>
            Setting this as current will deactivate all months in other periods.
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          {isEditing ? "Update" : "Create"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 20 },
  input: { marginBottom: 15 },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#F7F9FC",
    borderRadius: 8,
  },
  switchLabel: { fontSize: 16, color: "#333" },
  saveButton: { marginTop: 20, paddingVertical: 6, borderRadius: 8 },
});
