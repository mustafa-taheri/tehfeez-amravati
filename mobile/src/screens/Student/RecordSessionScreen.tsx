import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  TextInput,
  Button,
  Title,
  Appbar,
  SegmentedButtons,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function RecordSessionScreen({ route, navigation }: any) {
  const { studentId, student } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentAcademicMonth, setCurrentAcademicMonth] = useState<any | null>(
    null,
  );

  // Form state
  const [sessionType, setSessionType] = useState("MIXED");
  const [surahName, setSurahName] = useState("");
  const [siparaNumber, setSiparaNumber] = useState("");
  const [hifzProgress, setHifzProgress] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchCurrentAcademicMonth();
  }, []);

  const fetchCurrentAcademicMonth = async () => {
    try {
      const response = await apiClient.get("/academic-months/current");
      if (response.data.success) {
        setCurrentAcademicMonth(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch academic month", error);
    }
  };

  const submitSession = async () => {
    if (!surahName && !hifzProgress) {
      Alert.alert(
        "Validation",
        "Please provide Surah Name or Hifz Progress at least.",
      );
      return;
    }

    try {
      if (!currentAcademicMonth?.id) {
        Alert.alert(
          "Error",
          "No active academic month is available right now.",
        );
        return;
      }

      setLoading(true);
      const payload = {
        studentId,
        academicMonthId: currentAcademicMonth.id,
        sessionDate: new Date().toISOString(),
        sessionType,
        surahName,
        siparaNumber: siparaNumber ? parseInt(siparaNumber, 10) : undefined,
        hifzProgress,
        remarks,
      };

      const response = await apiClient.post("/quran-sessions", payload);

      if (response.data.success) {
        Alert.alert("Success", "Quran session recorded successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to record session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title="Record Session"
          subtitle={`${student.firstName} ${student.lastName}`}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.sectionTitle}>Session Details</Title>

        <View style={styles.segmentContainer}>
          <SegmentedButtons
            value={sessionType}
            onValueChange={setSessionType}
            buttons={[
              { value: "HIFZ", label: "Hifz" },
              { value: "MURAJAAH", label: "Murajaah" },
              { value: "MIXED", label: "Mixed" },
            ]}
          />
        </View>

        <TextInput
          label="Surah Name"
          value={surahName}
          onChangeText={setSurahName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Sipara (Juz) Number"
          value={siparaNumber}
          onChangeText={setSiparaNumber}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Hifz Progress (e.g., 2 pages, Ayah 1-15)"
          value={hifzProgress}
          onChangeText={setHifzProgress}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Teacher Remarks / Notes"
          value={remarks}
          onChangeText={setRemarks}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={submitSession}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          contentStyle={{ paddingVertical: 8 }}
        >
          Save Record
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  appBar: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  segmentContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 8,
  },
});
