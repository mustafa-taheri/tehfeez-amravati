import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
  Title,
  Button,
  Card,
  Text,
  Avatar,
  SegmentedButtons,
  ActivityIndicator,
  Appbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function MarkAttendanceScreenHuffaz({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [huffazs, setHuffazs] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>(
    {},
  );
  const [currentAcademicMonth, setCurrentAcademicMonth] = useState<any | null>(
    null,
  );

  useEffect(() => {
    fetchHuffazs();
  }, []);

  const fetchHuffazs = async () => {
    try {
      setLoading(true);
      const [huffazsResponse, monthResponse] = await Promise.all([
        apiClient.get("/huffaz"),
        apiClient.get("/academic-months/current").catch(() => null),
      ]);

      if (huffazsResponse.data.success) {
        const huffazList = huffazsResponse.data.data;
        setHuffazs(huffazList);

        const initialData: Record<string, string> = {};
        huffazList.forEach((h: any) => {
          initialData[h.id] = "PRESENT";
        });
        setAttendanceData(initialData);
      }

      if (monthResponse?.data?.success) {
        setCurrentAcademicMonth(monthResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch huffazs", error);
      Alert.alert("Error", "Could not load huffaz list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (userId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const submitAttendance = async () => {
    try {
      setSubmitting(true);

      if (!currentAcademicMonth?.id) {
        Alert.alert(
          "Error",
          "No active academic month is available right now.",
        );
        return;
      }

      const academicMonthId = currentAcademicMonth.id;
      const today = new Date().toISOString();

      const promises = huffazs.map((huffaz) =>
        apiClient
          .post("/attendance/huffaz", {
            userId: huffaz.id,
            academicMonthId,
            attendanceDate: today,
            attendanceStatus: attendanceData[huffaz.id],
          })
          .catch((e: any) =>
            console.log("Error marking for", huffaz.id, e.response?.data),
          ),
      );

      await Promise.all(promises);

      Alert.alert("Success", "Attendance has been recorded successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to submit attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderHuffazItem = ({ item }: { item: any }) => (
    <Card style={styles.huffazCard}>
      <Card.Content>
        <View style={styles.huffazHeader}>
          <Avatar.Text
            size={40}
            label={
              item.firstName.charAt(0) +
              (item.lastName ? item.lastName.charAt(0) : "")
            }
            style={styles.avatar}
          />
          <View style={styles.huffazInfo}>
            <Text style={styles.huffazName}>
              {item.firstName} {item.lastName}
            </Text>
          </View>
        </View>

        <SegmentedButtons
          value={attendanceData[item.id]}
          onValueChange={(value) => handleStatusChange(item.id, value)}
          buttons={[
            {
              value: "PRESENT",
              label: "P",
              checkedColor: "white",
              style:
                attendanceData[item.id] === "PRESENT"
                  ? { backgroundColor: "#4CAF50" }
                  : {},
            },
            {
              value: "HALF_DAY",
              label: "H",
              checkedColor: "white",
              style:
                attendanceData[item.id] === "HALF_DAY"
                  ? { backgroundColor: "#FFEB3B" }
                  : {},
            },
            {
              value: "ABSENT",
              label: "A",
              checkedColor: "white",
              style:
                attendanceData[item.id] === "ABSENT"
                  ? { backgroundColor: "#F44336" }
                  : {},
            },
            {
              value: "LEAVE",
              label: "L",
              checkedColor: "white",
              style:
                attendanceData[item.id] === "LEAVE"
                  ? { backgroundColor: "#FF9800" }
                  : {},
            },
            {
              value: "UZUR",
              label: "U",
              checkedColor: "white",
              style:
                attendanceData[item.id] === "UZUR"
                  ? { backgroundColor: "#9C27B0" }
                  : {},
            },
          ]}
          style={styles.segmentedButtons}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mark Attendance" />
      </Appbar.Header>

      <View style={styles.container}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          <Text style={styles.totalText}>Total: {huffazs.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={huffazs}
            keyExtractor={(item) => item.id}
            renderItem={renderHuffazItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Button
          mode="contained"
          onPress={submitAttendance}
          loading={submitting}
          disabled={loading || submitting || huffazs.length === 0}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Submit Attendance
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  appBar: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  huffazCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  huffazHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: "#3F51B5",
  },
  huffazInfo: {
    marginLeft: 15,
  },
  huffazName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  segmentedButtons: {
    marginTop: 5,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
