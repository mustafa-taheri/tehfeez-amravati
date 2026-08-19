import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Appbar,
  ActivityIndicator,
  RadioButton,
  Card,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { validateDDMMYYYY } from "../../utils/dateValidation";

const genders = ["MALE", "FEMALE"];
const statuses = ["ACTIVE", "INACTIVE"];

export default function StudentFormScreen({ navigation, route }: any) {
  const existingStudent = route.params?.student;
  const [loading, setLoading] = useState(false);
  const [marhalas, setMarhalas] = useState<any[]>([]);
  const [itsNumber, setItsNumber] = useState(existingStudent?.itsNumber || "");
  const [firstName, setFirstName] = useState(existingStudent?.firstName || "");
  const [lastName, setLastName] = useState(existingStudent?.lastName || "");
  const [fatherName, setFatherName] = useState(
    existingStudent?.fatherName || "",
  );
  const [mobileNumber, setMobileNumber] = useState(
    existingStudent?.mobileNumber || "",
  );
  const [parentMobileNumber, setParentMobileNumber] = useState(
    existingStudent?.parentMobileNumber || "",
  );
  const [address, setAddress] = useState(existingStudent?.address || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    existingStudent?.dateOfBirth
      ? new Date(existingStudent?.dateOfBirth)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "",
  );
  const [admissionDate, setAdmissionDate] = useState(
    existingStudent?.admissionDate
      ? new Date(existingStudent?.admissionDate)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")
      : "",
  );
  const [gender, setGender] = useState(existingStudent?.gender || "MALE");
  const [currentMarhalaId, setCurrentMarhalaId] = useState(
    existingStudent?.currentMarhalaId || "",
  );
  const [status, setStatus] = useState(existingStudent?.status || "ACTIVE");

  useEffect(() => {
    fetchMarhalas();
  }, []);

  const fetchMarhalas = async () => {
    try {
      const response = await apiClient.get("/marhalas");
      if (response.data.success) {
        setMarhalas(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch marhalas", error?.response?.data?.message);
    }
  };

  const saveStudent = async () => {
    if (!itsNumber || !firstName || !lastName || !currentMarhalaId) {
      Alert.alert("Validation", "Please fill in the required student details.");
      return;
    }
    console.log(dateOfBirth);
    console.log(validateDDMMYYYY(dateOfBirth));

    // Check if date format is valid (DD-MM-YYYY)
    if (!validateDDMMYYYY(dateOfBirth) || !validateDDMMYYYY(admissionDate)) {
      Alert.alert(
        "Validation",
        "Please enter valid date in DD-MM-YYYY format.",
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        itsNumber,
        firstName,
        lastName,
        fatherName,
        mobileNumber,
        parentMobileNumber,
        address,
        dateOfBirth: dateOfBirth || null,
        admissionDate: admissionDate || null,
        gender,
        currentMarhalaId,
        status,
      };

      if (existingStudent) {
        console.log("Existing Student Called", existingStudent.id, payload);

        const response = await apiClient.put(
          `/students/${existingStudent.id}`,
          payload,
        );
        if (response.data.success) {
          navigation.goBack();
        }
      } else {
        console.log("New Student", payload);

        const response = await apiClient.post("/students", payload);
        if (response.data.success) {
          navigation.goBack();
        }
      }
    } catch (error: any) {
      console.error("Failed to save student", error?.response?.data?.message);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Could not save student.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={existingStudent ? "Edit Student" : "Add Student"}
        />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          label="ITS Number *"
          value={itsNumber}
          onChangeText={setItsNumber}
          style={styles.field}
          mode="outlined"
        />
        <TextInput
          label="First Name *"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.field}
          mode="outlined"
        />
        <TextInput
          label="Last Name *"
          value={lastName}
          onChangeText={setLastName}
          style={styles.field}
          mode="outlined"
        />
        <TextInput
          label="Father Name"
          value={fatherName}
          onChangeText={setFatherName}
          style={styles.field}
          mode="outlined"
        />
        <TextInput
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          style={styles.field}
          mode="outlined"
          keyboardType="phone-pad"
        />
        <TextInput
          label="Parent Mobile Number"
          value={parentMobileNumber}
          onChangeText={setParentMobileNumber}
          style={styles.field}
          mode="outlined"
          keyboardType="phone-pad"
        />
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.field}
          mode="outlined"
          multiline
        />
        <TextInput
          label="Date of Birth *"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          style={styles.field}
          mode="outlined"
          placeholder="DD-MM-YYYY"
        />
        <TextInput
          label="Admission Date *"
          value={admissionDate}
          onChangeText={setAdmissionDate}
          style={styles.field}
          mode="outlined"
          placeholder="DD-MM-YYYY"
          disabled={existingStudent ? true : false}
        />

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Gender</Text>
            <RadioButton.Group
              onValueChange={(value) => setGender(value)}
              value={gender}
            >
              <View style={styles.radioRow}>
                {genders.map((option) => (
                  <View key={option} style={styles.radioOption}>
                    <RadioButton value={option} />
                    <Text>{option}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Marhala *</Text>
            {marhalas.map((marhala) => (
              <Button
                key={marhala.id}
                mode={
                  currentMarhalaId === marhala.id ? "contained" : "outlined"
                }
                onPress={() => setCurrentMarhalaId(marhala.id)}
                style={styles.optionButton}
              >
                {marhala.name}
              </Button>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Status</Text>
            <RadioButton.Group
              onValueChange={(value) => setStatus(value)}
              value={status}
            >
              <View style={styles.radioRow}>
                {statuses.map((option) => (
                  <View key={option} style={styles.radioOption}>
                    <RadioButton value={option} />
                    <Text>{option}</Text>
                  </View>
                ))}
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={saveStudent}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
        >
          {existingStudent ? "Update Student" : "Create Student"}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 14, backgroundColor: "#fff" },
  card: { marginVertical: 10, borderRadius: 12, elevation: 2 },
  sectionLabel: { fontWeight: "bold", marginBottom: 12 },
  radioRow: { flexDirection: "row", flexWrap: "wrap" },
  radioOption: { flexDirection: "row", alignItems: "center", marginRight: 22 },
  optionButton: { marginBottom: 10 },
  saveButton: { marginTop: 20, borderRadius: 8 },
});
