import React, { useEffect, useState } from "react";
import {
  Appbar,
  Button,
  Portal,
  Text,
  TextInput,
  Switch,
  HelperText,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import apiClient from "../../api/client";
import { validateDDMMYYYY } from "../../utils/dateValidation";
import DropdownSelect from "react-native-input-select";
import { forcedLightTheme } from "../../../App";

const AcademicMonthFormScreen = ({ navigation, route }: any) => {
  const month = route.params?.month;
  const isEditing = !!month;

  const [monthName, setMonthName] = useState(month ? month.name : "");
  const [monthNumber, setMonthNumber] = useState(
    month ? month.monthNumber?.toString() : "",
  );
  const [startDate, setStartDate] = useState(
    month?.startDate
      ? new Date(month.startDate)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "",
  );
  const [endDate, setEndDate] = useState(
    month?.endDate
      ? new Date(month.endDate).toLocaleDateString("en-GB").replace(/\//g, "-")
      : "",
  );
  const [workingDays, setWorkingDays] = useState(
    month ? month.workingDays?.toString() : "26",
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState(
    month ? month.academicPeriodId : "",
  );
  const [isCurrent, setIsCurrent] = useState(month ? month.isCurrent : false);
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
      const payload = {
        name: monthName,
        monthNumber: parseInt(monthNumber),
        startDate: startDate.split("-").reverse().join("-"),
        endDate: endDate.split("-").reverse().join("-"),
        academicPeriodId: selectedPeriodId,
        workingDays: parseInt(workingDays),
        isCurrent,
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(
          `/academic-months/month/${month.id}`,
          payload,
        );
      } else {
        response = await apiClient.post(
          "/academic-months/month/create",
          payload,
        );
      }

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
        `An error occurred while saving the academic month. Please try again. ${error?.response?.data?.message || ""}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={forcedLightTheme}>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header
            mode="small"
            statusBarHeight={0}
            style={[styles.appBar, { height: 60 }]}
          >
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content
              title={isEditing ? "Edit Academic Month" : "Add Academic Month"}
            />
          </Appbar.Header>
          <ScrollView contentContainerStyle={styles.container}>
            <DropdownSelect
              label={"Select Academic Period"}
              options={periodsOptions}
              selectedValue={selectedPeriodId}
              onValueChange={(value) => setSelectedPeriodId(value)}
              dropdownStyle={{
                minHeight: 48,
                elevation: 2,
                paddingVertical: 15,
                paddingHorizontal: 16,
              }}
              dropdownIconStyle={{
                top: 55,
              }}
            />
            <TextInput
              label="Month Name *"
              value={monthName}
              onChangeText={setMonthName}
              style={[styles.field]}
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
            <TextInput
              label="Working Days "
              value={workingDays}
              onChangeText={setWorkingDays}
              keyboardType="numeric"
              style={styles.field}
              mode="outlined"
            />
            {isEditing && (
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Mark as Current Month</Text>
                <Switch value={isCurrent} onValueChange={setIsCurrent} />
              </View>
            )}
            {isEditing && (
              <HelperText type="info" visible={true}>
                Setting this as current will deactivate all other months.
              </HelperText>
            )}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              {isEditing ? "Update" : "Submit"}
            </Button>
          </ScrollView>
        </SafeAreaView>
      </Portal.Host>
    </PaperProvider>
  );
};

export default AcademicMonthFormScreen;

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  switchLabel: { fontSize: 16, color: "#333" },
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 14, backgroundColor: "#fff" },
  submitButton: { marginTop: 10, borderRadius: 8 },
  label: { fontSize: 14, color: "#666", marginBottom: 6, marginTop: 12 },
});
