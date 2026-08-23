import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  TextInput,
  Text,
  HelperText,
  useTheme,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import apiClient from "../../api/client";

export default function FeeCollectionFormScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [academicMonths, setAcademicMonths] = useState<any[]>([]);
  const [feeConfigs, setFeeConfigs] = useState<any[]>([]);

  const [studentId, setStudentId] = useState<any>("");
  const [academicMonthId, setAcademicMonthId] = useState<any>("");
  const [marhalaFeeConfigurationId, setMarhalaFeeConfigurationId] =
    useState<any>("");
  const [configuredFee, setConfiguredFee] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [waivedAmount, setWaivedAmount] = useState("0");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchOptions();
  }, []);

  const studentsOptions = students.map((s) => ({
    label: `${s.firstName} ${s.lastName || ""} (${s.itsNumber})`,
    value: s.id,
  }));
  const academicMonthsOptions = academicMonths.map((m) => ({
    label: m.name,
    value: m.id,
  }));
  const feeConfigsOptions = feeConfigs
    .filter((c) => c.isActive)
    .map((c) => ({
      label: `${c.marhala?.name} - ₹${c.monthlyFee}`,
      value: c.id,
    }));

  const fetchOptions = async () => {
    try {
      const [studentsRes, monthsRes, configsRes] = await Promise.all([
        apiClient.get("/students"),
        apiClient.get("/academic-months/periods/months"),
        apiClient.get("/marhalas/fee-configs"),
      ]);

      if (studentsRes.data.success) setStudents(studentsRes.data.data);
      if (monthsRes.data.success) setAcademicMonths(monthsRes.data.data);
      if (configsRes.data.success) setFeeConfigs(configsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch options for fee collection form", err);
    }
  };

  const handleConfigSelect = (configId: string) => {
    setMarhalaFeeConfigurationId(configId);
    const config = feeConfigs.find((c) => c.id === configId);
    if (config) {
      setConfiguredFee(config.monthlyFee.toString());
    } else {
      setConfiguredFee("0");
    }
  };

  const handleSave = async () => {
    if (!studentId || !academicMonthId || !marhalaFeeConfigurationId) {
      setError("Please select Student, Month, and Fee Configuration.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const payload = {
        studentId,
        academicMonthId,
        marhalaFeeConfigurationId,
        configuredFee: parseFloat(configuredFee),
        discountAmount: parseFloat(discountAmount || "0"),
        waivedAmount: parseFloat(waivedAmount || "0"),
        remarks,
      };

      const response = await apiClient.post(
        "/finance/fee-collections",
        payload,
      );

      if (response.data.success) {
        navigation.goBack();
      } else {
        setError(response.data.message || "Failed to create fee collection.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header mode="small" style={styles.appBar}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Create Fee Collection" />
          </Appbar.Header>

          <ScrollView contentContainerStyle={styles.container}>
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <Text style={styles.label}>Select Student *</Text>

            <Dropdown
              label={<Text style={{ fontSize: 16 }}>{"Student"}</Text>}
              options={studentsOptions}
              value={studentId}
              onSelect={setStudentId}
              mode="outlined"
            />

            <Text style={styles.label}>Select Academic Month *</Text>
            <Dropdown
              label={<Text style={{ fontSize: 16 }}>{"Academic Month"}</Text>}
              options={academicMonthsOptions}
              value={academicMonthId}
              onSelect={setAcademicMonthId}
              mode="outlined"
            />

            <Text style={styles.label}>Select Fee Configuration *</Text>
            <Dropdown
              label={
                <Text style={{ fontSize: 16 }}>{"Fee Configuration"}</Text>
              }
              options={feeConfigsOptions}
              value={marhalaFeeConfigurationId}
              onSelect={handleConfigSelect}
              mode="outlined"
            />

            <TextInput
              label="Configured Fee (₹)"
              value={configuredFee}
              disabled
              style={[styles.input, { marginTop: 14 }]}
              mode="outlined"
            />

            <TextInput
              label="Discount Amount (₹)"
              value={discountAmount}
              onChangeText={setDiscountAmount}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Waived Amount (₹)"
              value={waivedAmount}
              onChangeText={setWaivedAmount}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Remarks"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              style={styles.input}
              mode="outlined"
            />

            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
            >
              Create Record
            </Button>
          </ScrollView>
        </SafeAreaView>
      </Portal.Host>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: "#666", marginBottom: 6, marginTop: 12 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#F7F9FC",
  },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  saveButton: { marginTop: 20, paddingVertical: 6, borderRadius: 8 },
});
