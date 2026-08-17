import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
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
  const [currentAcademicMonth, setCurrentAcademicMonth] = useState<any | null>(
    null,
  );
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");
  const [selectedHuffaz, setSelectedHuffaz] = useState<any | null>(null);
  const [huffazList, setHuffazList] = useState<any[]>([]);

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

      if (huffazsResponse?.data?.success) {
        const huffazList = huffazsResponse.data.data;
        setHuffazList(huffazList);
      }

      if (monthResponse?.data?.success) {
        setCurrentAcademicMonth(monthResponse.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch huffazs", error?.response?.data?.message);
      Alert.alert(
        "Error",
        `Could not load huffaz list. ${error?.response?.data?.message || ""}`,
      );
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = (status: string) => {
    setAttendanceStatus(status);
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

      if (!selectedHuffaz?.id) {
        Alert.alert(
          "Error",
          "No Huffaz selected. Please go back and select a Huffaz.",
        );
        return;
      }

      const academicMonthId = currentAcademicMonth.id;
      const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

      const response = await apiClient.post("/attendance/huffaz", {
        userId: selectedHuffaz.id,
        attendanceStatus: attendanceStatus,
        attendanceDate: today,
        academicMonthId: academicMonthId,
      });

      if (response.data.success) {
        Alert.alert("Success", "Attendance marked successfully.");
      } else {
        Alert.alert("Error", "Failed to mark attendance. Please try again.");
      }
    } catch (error: any) {
      console.error(
        "Failed to submit attendance",
        error?.response?.data?.message,
      );
      Alert.alert(
        "Error",
        `Could not submit attendance. ${error?.response?.data?.message || "An unknown error occurred."}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderHuffazItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => setSelectedHuffaz(item)}>
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
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
          <Text style={styles.totalText}>Total: {huffazList.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={huffazList}
            keyExtractor={(item) => item.id}
            renderItem={renderHuffazItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
        {selectedHuffaz && (
          <View style={styles.attendanceUI}>
            <Text style={styles.huffazName}>
              {selectedHuffaz.firstName} {selectedHuffaz.lastName}
            </Text>

            <SegmentedButtons
              density="small"
              value={attendanceStatus}
              onValueChange={handleStatusChange}
              style={styles.segmentedButtonsContainer}
              buttons={[
                {
                  value: "PRESENT",
                  label: "P",
                  checkedColor: "white",
                  style: [
                    styles.singleButton,
                    {
                      backgroundColor:
                        attendanceStatus === "PRESENT" ? "#4CAF50" : "",
                    },
                  ],
                },
                {
                  value: "HALF_DAY",
                  label: "H",
                  checkedColor: "white",
                  style: [
                    styles.singleButton,
                    {
                      backgroundColor:
                        attendanceStatus === "HALF_DAY" ? "#FFEB3B" : "",
                    },
                  ],
                },
                {
                  value: "ABSENT",
                  label: "A",
                  checkedColor: "white",
                  style: [
                    styles.singleButton,
                    {
                      backgroundColor:
                        attendanceStatus === "ABSENT" ? "#F44336" : "",
                    },
                  ],
                },
                {
                  value: "LEAVE",
                  label: "L",
                  checkedColor: "white",
                  style: [
                    styles.singleButton,
                    {
                      backgroundColor:
                        attendanceStatus === "LEAVE" ? "#FF9800" : "",
                    },
                  ],
                },
                {
                  value: "UZUR",
                  label: "U",
                  checkedColor: "white",
                  style: [
                    styles.singleButton,
                    {
                      backgroundColor:
                        attendanceStatus === "UZUR" ? "#9C27B0" : "",
                    },
                  ],
                },
              ]}
            />

            <Button
              mode="contained"
              onPress={submitAttendance}
              loading={submitting}
              disabled={loading || submitting || huffazList.length === 0}
              style={styles.submitButton}
            >
              Submit Attendance
            </Button>
          </View>
        )}
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
  attendanceUI: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  segmentedButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 15,
  },
  singleButton: {
    flex: 1,
    minWidth: 0,
  },
});
