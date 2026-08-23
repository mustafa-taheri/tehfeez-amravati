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
  const [sessionDate, setSessionDate] = useState(
    new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  );
  const [surahName, setSurahName] = useState("");
  const [siparaNumber, setSiparaNumber] = useState("");
  // const [startAyah, setStartAyah] = useState("");
  // const [endAyah, setEndAyah] = useState("");
  const [hifzProgress, setHifzProgress] = useState("");
  const [murajaahJuz, setMurajaahJuz] = useState("");
  const [murajaahMarks, setMurajaahMarks] = useState("");
  const [juzHaaliMarks, setJuzHaaliMarks] = useState("");
  const [jadeedStartAyah, setJadeedStartAyah] = useState("");
  // const [jadeedEndAyah, setJadeedEndAyah] = useState("");
  // const [tasmeeMarks, setTasmeeMarks] = useState("");
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
    if (!sessionDate || !sessionType) {
      Alert.alert(
        "Validation",
        "Please provide a session date and session type.",
      );
      return;
    }

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
        sessionDate: sessionDate,
        sessionType,
        surahName,
        siparaNumber: siparaNumber ? parseInt(siparaNumber, 10) : undefined,
        // startAyah: startAyah ? parseInt(startAyah, 10) : undefined,
        // endAyah: endAyah ? parseInt(endAyah, 10) : undefined,
        hifzProgress,
        murajaahJuz: murajaahJuz ? parseInt(murajaahJuz, 10) : undefined,
        murajaahMarks: murajaahMarks ? parseInt(murajaahMarks, 10) : undefined,
        juzHaaliMarks: juzHaaliMarks ? parseInt(juzHaaliMarks, 10) : undefined,
        jadeedStartAyah: jadeedStartAyah,
        // jadeedEndAyah: jadeedEndAyah ? parseInt(jadeedEndAyah, 10) : undefined,
        // tasmeeMarks: tasmeeMarks ? parseInt(tasmeeMarks, 10) : undefined,
        remarks,
      };

      const response = await apiClient.post("/quran-sessions", payload);

      if (response.data.success) {
        Alert.alert("Success", "Quran session recorded successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error(error?.response?.data?.message);
      Alert.alert(
        "Error",
        `Failed to record session. ${error?.response?.data?.message || ""}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header mode="small" style={styles.appBar}>
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
          label="Session Date (DD-MM-YYYY)"
          value={sessionDate}
          onChangeText={setSessionDate}
          mode="outlined"
          style={styles.input}
          disabled
        />

        <TextInput
          label="Surah Name (e.g. Ar-Rahmaan) *"
          value={surahName}
          onChangeText={setSurahName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Sipara (Juz) Number *"
          value={siparaNumber}
          onChangeText={setSiparaNumber}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        {/* <TextInput
          label="Starting Ayah"
          value={startAyah}
          onChangeText={setStartAyah}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Ending Ayah"
          value={endAyah}
          onChangeText={setEndAyah}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        /> */}

        <TextInput
          label="Hifz Progress (e.g., 2 pages, Ayah 1-15) *"
          value={hifzProgress}
          onChangeText={setHifzProgress}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Murajaah Juz"
          value={murajaahJuz}
          onChangeText={setMurajaahJuz}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Murajaah Marks"
          value={murajaahMarks}
          onChangeText={setMurajaahMarks}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Juz Haali Marks"
          value={juzHaaliMarks}
          onChangeText={setJuzHaaliMarks}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Jadeed Starting Ayah (e.g. 1:202)"
          value={jadeedStartAyah}
          onChangeText={setJadeedStartAyah}
          mode="outlined"
          style={styles.input}
        />

        {/* <TextInput
          label="Jadeed Ending Ayah"
          value={jadeedEndAyah}
          onChangeText={setJadeedEndAyah}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        /> */}

        {/* <TextInput
          label="Tasmee Marks"
          value={tasmeeMarks}
          onChangeText={setTasmeeMarks}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        /> */}

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
