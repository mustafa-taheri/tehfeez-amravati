import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Title,
  Card,
  Text,
  Avatar,
  Button,
  Appbar,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function StudentDetailScreen({ route, navigation }: any) {
  const { studentId, student: initialStudent } = route.params;
  const [student, setStudent] = useState(initialStudent);
  const [loading, setLoading] = useState(!initialStudent);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchStudentData();
    fetchRecentSessions();
  }, []);

  const fetchStudentData = async () => {
    if (initialStudent) return;
    try {
      const response = await apiClient.get(`/students/${studentId}`);
      if (response.data.success) {
        setStudent(response.data.data);
      }
    } catch (error: any) {
      console.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const response = await apiClient.get(
        `/quran-sessions?studentId=${studentId}`,
      );
      if (response.data.success) {
        setRecentSessions(response.data.data);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch recent sessions",
        error?.response?.data?.message,
      );
    }
  };

  if (loading || !student) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Student Details" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerProfile}>
          <Avatar.Text
            size={80}
            label={student.firstName.charAt(0)}
            style={styles.avatar}
          />
          <Title style={styles.name}>
            {student.firstName} {student.lastName}
          </Title>
          <Text style={styles.itsNumber}>ITS: {student.itsNumber}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{student.status || "ACTIVE"}</Text>
          </View>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Contact Info</Title>
            <Divider style={styles.divider} />
            <Text style={styles.infoText}>
              Father: {student.fatherName || "N/A"}
            </Text>
            <Text style={styles.infoText}>
              Parent Mobile: {student.parentMobileNumber}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actionsRow}>
          <Button
            mode="contained"
            icon="book-open-variant"
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("RecordSession", {
                studentId: student.id,
                student,
              })
            }
          >
            Record Session
          </Button>
          <Button
            mode="outlined"
            icon="pencil"
            style={styles.actionButton}
            onPress={() => navigation.navigate("StudentForm", { student })}
          >
            Edit
          </Button>
        </View>
        <View style={styles.actionsRow}>
          <Button
            mode="outlined"
            icon="chart-timeline-variant"
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate("AttendanceReport", { studentId: student.id })
            }
          >
            Attendance Report
          </Button>
          <Button
            mode="outlined"
            icon="trash-can"
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                "Delete Student",
                "Are you sure you want to delete this student?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        const response = await apiClient.delete(
                          `/students/${student.id}`,
                        );
                        if (response.data.success) {
                          navigation.goBack();
                        }
                      } catch (error: any) {
                        console.error(
                          "Failed to delete student",
                          error?.response?.data?.message,
                        );
                        Alert.alert("Error", "Could not delete student.");
                      }
                    },
                  },
                ],
              );
            }}
          >
            Delete
          </Button>
        </View>

        <Title style={styles.sectionTitleList}>Recent Quran Journey</Title>
        {recentSessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={{ textAlign: "center", color: "#888" }}>
                No sessions recorded yet.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          recentSessions.map((session, index) => (
            <Card key={session.id || index} style={styles.sessionCard}>
              <Card.Content>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.sessionDate).toDateString()}
                  </Text>
                  <View style={styles.sessionTypeBadge}>
                    <Text style={styles.sessionTypeText}>
                      {session.sessionType}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.dividerSmall} />
                {session.surahName && (
                  <Text style={styles.sessionDetail}>
                    Surah: {session.surahName}
                  </Text>
                )}
                {session.siparaNumber && (
                  <Text style={styles.sessionDetail}>
                    Sipara: {session.siparaNumber}
                  </Text>
                )}
                {session.hifzProgress && (
                  <Text style={styles.sessionDetail}>
                    Progress: {session.hifzProgress}
                  </Text>
                )}
                {session.remarks && (
                  <Text
                    style={[
                      styles.sessionDetail,
                      { fontStyle: "italic", marginTop: 5 },
                    ]}
                  >
                    Note: {session.remarks}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
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
    padding: 15,
    paddingBottom: 40,
  },
  headerProfile: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: "#3F51B5",
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  itsNumber: {
    color: "#666",
    fontSize: 16,
  },
  badge: {
    marginTop: 10,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#444",
    marginBottom: 5,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  sectionTitleList: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
  },
  sessionCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: {
    fontWeight: "bold",
    color: "#333",
  },
  sessionTypeBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sessionTypeText: {
    color: "#2196F3",
    fontSize: 11,
    fontWeight: "bold",
  },
  dividerSmall: {
    marginVertical: 8,
  },
  sessionDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },
});
