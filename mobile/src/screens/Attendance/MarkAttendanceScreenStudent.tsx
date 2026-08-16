//Creating a component to mark attendance of one student after clicking on the student name in the list of students
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../api/client";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  Card,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const MarkAttendanceScreenStudent = ({ navigation }: any) => {
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentAcademicMonth, setCurrentAcademicMonth] = useState<any | null>(
    null,
  );
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentList, setStudentList] = useState<any[]>([]);

  useEffect(() => {
    fetchStudentList();
  }, []);

  const fetchStudentList = async () => {
    try {
      setLoading(true);
      const [studentsResponse, monthResponse] = await Promise.all([
        apiClient.get("/students"),
        apiClient.get("/academic-months/current").catch(() => null),
      ]);

      if (studentsResponse.data.success) {
        const studentList = studentsResponse.data.data;
        setStudentList(studentList);
      }

      if (monthResponse?.data?.success) {
        setCurrentAcademicMonth(monthResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
      Alert.alert("Error", "Could not load student list. Please try again.");
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
          "No current academic month found. Please contact the administrator.",
        );
        return;
      }

      if (!selectedStudent?.id) {
        Alert.alert(
          "Error",
          "No student selected. Please go back and select a student.",
        );
        return;
      }
      const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

      const response = await apiClient.post("/attendance/student", {
        studentId: selectedStudent.id,
        attendanceStatus: attendanceStatus,
        attendanceDate: today,
        academicMonthId: currentAcademicMonth.id,
      });
      if (response.data.success) {
        Alert.alert("Success", "Attendance marked successfully.");
      } else {
        Alert.alert("Error", "Failed to mark attendance. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to submit attendance", error);
      Alert.alert(
        "Error",
        `Could not submit attendance. ${error?.response?.data?.message || "An unknown error occurred."}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => setSelectedStudent(item)}>
      <Card style={styles.studentCard}>
        <Card.Content>
          <View style={styles.studentHeader}>
            <Avatar.Text
              size={40}
              label={
                item.firstName.charAt(0) +
                (item.lastName ? item.lastName.charAt(0) : "")
              }
              style={styles.avatar}
            />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.itsNumber}>ITS: {item.itsNumber}</Text>
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
      {/* Render the list of Students */}
      <View style={styles.container}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          <Text style={styles.totalText}>Total: {studentList.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={studentList}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
        {/* Render Attendance UI for the selected student */}
        {selectedStudent && (
          <View style={styles.attendanceUI}>
            <Text style={styles.studentName}>
              {selectedStudent.firstName} {selectedStudent.lastName}
            </Text>
            <Text style={styles.itsNumber}>
              ITS: {selectedStudent.itsNumber}
            </Text>
            <View style={styles.segmentedButtons}>
              <SegmentedButtons
                value={attendanceStatus}
                onValueChange={handleStatusChange}
                buttons={[
                  {
                    value: "PRESENT",
                    label: "P",
                    checkedColor: "white",
                    style:
                      attendanceStatus === "PRESENT"
                        ? { backgroundColor: "#4CAF50" }
                        : {},
                  },
                  {
                    value: "ABSENT",
                    label: "A",
                    checkedColor: "white",
                    style:
                      attendanceStatus === "ABSENT"
                        ? { backgroundColor: "#F44336" }
                        : {},
                  },
                  {
                    value: "LEAVE",
                    label: "L",
                    checkedColor: "white",
                    style:
                      attendanceStatus === "LEAVE"
                        ? { backgroundColor: "#FF9800" }
                        : {},
                  },
                  {
                    value: "UZUR",
                    label: "U",
                    checkedColor: "white",
                    style:
                      attendanceStatus === "UZUR"
                        ? { backgroundColor: "#9C27B0" }
                        : {},
                  },
                ]}
              />
            </View>
            <Button
              mode="contained"
              onPress={submitAttendance}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
            >
              Submit Attendance
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MarkAttendanceScreenStudent;

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
  studentCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: "#3F51B5",
  },
  studentInfo: {
    marginLeft: 15,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itsNumber: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
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
});
