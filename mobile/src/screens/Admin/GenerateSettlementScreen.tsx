import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Button, Text, HelperText, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import apiClient from "../../api/client";

export default function GenerateSettlementScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [academicMonths, setAcademicMonths] = useState<any[]>([]);
  const [academicMonthId, setAcademicMonthId] = useState("");

  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchMonths = async () => {
    try {
      const response = await apiClient.get("/academic-months/periods/months");
      if (response.data.success) {
        setAcademicMonths(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch months", err);
    }
  };

  const handleGenerate = async () => {
    if (!academicMonthId) {
      setError("Please select an Academic Month.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.post("/finance/settlements/generate", {
        academicMonthId,
      });

      if (response.data.success) {
        alert("Settlement generated successfully!");
        navigation.goBack();
      } else {
        setError(response.data.message || "Failed to generate settlement.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Generate Settlement" />
      </Appbar.Header>

      <View style={styles.container}>
        {error && (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        )}

        <Text style={styles.label}>Academic Month *</Text>
        <View style={styles.pickerContainer}>
          {/* <Picker
            selectedValue={academicMonthId}
            onValueChange={(val) => setAcademicMonthId(val)}
          >
            <Picker.Item label="Select Month" value="" />
            {academicMonths.map((m) => (
              <Picker.Item key={m.id} label={m.name} value={m.id} />
            ))}
          </Picker> */}
          <PaperProvider>
            <Dropdown
              label="Select Month"
              options={academicMonths}
              value={academicMonthId}
              onSelect={(value) => setAcademicMonthId}
              mode="outlined"
            />
          </PaperProvider>
        </View>

        <Button
          mode="contained"
          onPress={handleGenerate}
          loading={loading}
          disabled={loading}
          style={styles.generateButton}
        >
          Generate
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 20 },
  label: { fontSize: 14, color: "#666", marginBottom: 6, marginTop: 12 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "#F7F9FC",
  },
  generateButton: { marginTop: 10, paddingVertical: 6, borderRadius: 8 },
});
