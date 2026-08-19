import React, { useEffect, useState } from "react";
import { Appbar, Button, Portal, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Dropdown } from "react-native-paper-dropdown";
import { Provider as PaperProvider } from "react-native-paper";
import apiClient from "../../api/client";
import { validateDDMMYYYY } from "../../utils/dateValidation";

const AcademicMonthFormScreen = ({ navigation, route }: any) => {
  const [monthName, setMonthName] = useState("");
  const [monthNumber, setMonthNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [periodsOptions, setPeriodsOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchAcademicPeriods();
  }, []);

  const fetchAcademicPeriods = async () => {
    let periodsOptions = [];
    try {
      const periodsResponse = await apiClient.get("/academic-months/periods");
      if (periodsResponse?.data?.success) {
        periodsOptions = periodsResponse?.data?.data;
      } else {
        console.error("Failed to fetch academic periods");
        periodsOptions = [];
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch academic periods",
        error?.response?.data?.message,
      );
      periodsOptions = [];
    }
    setPeriodsOptions(
      periodsOptions.map((period: any) => ({
        label: period.name,
        value: period.id,
      })),
    );
  };

  const handleSubmit = async () => {
    if (
      !monthName ||
      !monthNumber ||
      !startDate ||
      !endDate ||
      !selectedPeriodId
    ) {
      Alert.alert("Validation ", "Please fill in all fields.");
      return;
    }
    // Check if date format is valid (DD-MM-YYYY)
    if (!validateDDMMYYYY(startDate) || !validateDDMMYYYY(endDate)) {
      Alert.alert("Validation ", "Please enter dates in DD-MM-YYYY format.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/academic-months/month/create", {
        name: monthName,
        monthNumber: parseInt(monthNumber),
        startDate,
        endDate,
        academicPeriodId: selectedPeriodId,
      });

      if (response.data.success) {
        navigation.goBack();
      } else {
        Alert.alert(
          "Error",
          "Failed to create academic month. Please try again.",
        );
      }
    } catch (error: any) {
      console.error(
        "Failed to create academic month",
        error?.response?.data?.message,
      );
      Alert.alert(
        "Error",
        `An error occurred while creating the academic month. Please try again. ${error?.response?.data?.message || ""}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header style={styles.appBar}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title={"Add Academic Month"} />
          </Appbar.Header>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Select Academic Period</Text>
            <Dropdown
              // label="Select Academic Period *"
              options={periodsOptions}
              value={selectedPeriodId}
              onSelect={setSelectedPeriodId}
              // menuContentStyle={styles.field}
              mode="outlined"
            />
            <TextInput
              label="Month Name *"
              value={monthName}
              onChangeText={setMonthName}
              style={styles.field}
              mode="outlined"
            />
            <TextInput
              label="Month Number *"
              value={monthNumber}
              onChangeText={setMonthNumber}
              style={styles.field}
              mode="outlined"
            />
            <TextInput
              label="Start Date (DD-MM-YYYY) *"
              value={startDate}
              onChangeText={setStartDate}
              style={styles.field}
              mode="outlined"
            />
            <TextInput
              label="End Date (DD-MM-YYYY) *"
              value={endDate}
              onChangeText={setEndDate}
              style={styles.field}
              mode="outlined"
            />
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Submit
            </Button>
          </ScrollView>
        </SafeAreaView>
      </Portal.Host>
    </PaperProvider>
  );
};

export default AcademicMonthFormScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 14, backgroundColor: "#fff" },
  submitButton: { marginTop: 10, borderRadius: 8 },
  label: { fontSize: 14, color: "#666", marginBottom: 6, marginTop: 12 },
});
