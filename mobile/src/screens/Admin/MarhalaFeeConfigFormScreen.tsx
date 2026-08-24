import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import {
  Appbar,
  Button,
  TextInput,
  Text,
  HelperText,
  Switch,
  useTheme,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { validateDDMMYYYY } from "../../utils/dateValidation";
import { Alert } from "react-native";
import apiClient from "../../api/client";
import { forcedLightTheme } from "../../../App";
import DropdownSelect from "react-native-input-select";

export default function MarhalaFeeConfigFormScreen({ navigation, route }: any) {
  const { config } = route.params || {};
  const isEditing = !!config;
  const { colors } = useTheme();

  const [marhalaId, setMarhalaId] = useState(config?.marhalaId || "");
  const [academicPeriodId, setAcademicPeriodId] = useState(
    config?.academicPeriodId || "",
  );
  const [monthlyFee, setMonthlyFee] = useState(
    config?.monthlyFee?.toString() || "",
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    config?.effectiveFrom
      ? new Date(config.effectiveFrom)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "",
  );
  const [effectiveTo, setEffectiveTo] = useState<string>(
    config?.effectiveTo
      ? new Date(config.effectiveTo)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "",
  );
  const [isActive, setIsActive] = useState(
    config?.isActive !== undefined ? config.isActive : true,
  );

  const [marhalas, setMarhalas] = useState<any[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const marhalasOptions = marhalas.map((m) => ({ label: m.name, value: m.id }));
  const academicPeriodsOptions = academicPeriods.map((p) => ({
    label: p.name,
    value: p.id,
  }));

  const fetchOptions = async () => {
    try {
      const [marhalasRes, periodsRes] = await Promise.all([
        apiClient.get("/marhalas"),
        apiClient.get("/academic-months/periods"),
      ]);

      if (marhalasRes.data.success) {
        setMarhalas(marhalasRes.data.data);
      }
      if (periodsRes.data.success) {
        setAcademicPeriods(periodsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch options", err);
    }
  };

  const handleSave = async () => {
    if (
      !validateDDMMYYYY(effectiveFrom) ||
      (effectiveTo && !validateDDMMYYYY(effectiveTo))
    ) {
      Alert.alert("Validation", "Please enter dates in DD-MM-YYYY format.");
      return;
    }
    if (!marhalaId || !academicPeriodId || !monthlyFee || !effectiveFrom) {
      setError("Please fill all required fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const payload = {
        marhalaId,
        academicPeriodId,
        monthlyFee: parseFloat(monthlyFee),
        effectiveFrom: effectiveFrom.split("-").reverse().join("-"),
        effectiveTo: effectiveTo
          ? effectiveTo.split("-").reverse().join("-")
          : null,
        isActive,
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(
          `/marhalas/fee-configs/${config.id}`,
          payload,
        );
      } else {
        response = await apiClient.post("/marhalas/fee-configs", payload);
      }

      if (response.data.success) {
        navigation.goBack();
      } else {
        setError(response.data.message || "Failed to save configuration.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={forcedLightTheme}>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header mode="small" style={styles.appBar}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content
              title={isEditing ? "Edit Configuration" : "Add Configuration"}
            />
          </Appbar.Header>

          <ScrollView contentContainerStyle={styles.container}>
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}
            <Text style={styles.label}>Select Academic Period *</Text>
            <DropdownSelect
              label={"Academic Period"}
              options={academicPeriodsOptions}
              selectedValue={academicPeriodId}
              onValueChange={(value) => setAcademicPeriodId(value)}
            />
            <Text style={styles.label}>Select Marhala *</Text>

            <DropdownSelect
              label={"Marhala"}
              options={marhalasOptions}
              selectedValue={marhalaId}
              onValueChange={(value) => setMarhalaId(value)}
            />

            <TextInput
              label="Monthly Fee (₹) *"
              value={monthlyFee}
              onChangeText={setMonthlyFee}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Effective From (DD-MM-YYYY) *"
              value={effectiveFrom}
              onChangeText={setEffectiveFrom}
              placeholder="DD-MM-YYYY"
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Effective To (Optional) (DD-MM-YYYY)"
              value={effectiveTo}
              onChangeText={setEffectiveTo}
              placeholder="DD-MM-YYYY"
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.switchContainer}>
              <Text style={{ fontSize: 16 }}>Is Active?</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
            >
              Save Configuration
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
  container: { padding: 20 },
  label: { fontSize: 14, color: "#666", marginBottom: 6, marginTop: 12 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#F7F9FC",
  },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  dateButton: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  dateButtonContent: {
    height: 48,
    justifyContent: "flex-start",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: { marginTop: 20, paddingVertical: 6, borderRadius: 8 },
});
