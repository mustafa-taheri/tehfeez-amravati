import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Avatar,
  IconButton,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/client";

export default function HuffazDashboardScreen({ navigation }: any) {
  const { signOut, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myStudents: 0,
    quranSessionsToday: 0,
  });
  const [currentAcademicMonth, setCurrentAcademicMonth] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchDashboardStats();
    getHuffazAttendanceCount();
  }, []);

  const getHuffazAttendanceCount = async () => {
    let count = 0;
    try {
      const response = await apiClient.get(`/attendance/huffaz/${user?.id}`);
      if (response.data.success) {
        count = response.data.data?.count ?? 0;
      }
    } catch (error: any) {
      console.error(
        "Error fetching Huffaz attendance count:",
        error?.response?.data?.message,
      );
    }
    setAttendanceCount(count);
  };

  const fetchDashboardStats = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      const [studentsResponse, academicMonthResponse, sessionsResponse] =
        await Promise.all([
          apiClient.get("/students"),
          apiClient.get("academic-months/current").catch(() => null),
          apiClient
            .get("/quran-sessions", {
              params: {
                sessionDate: new Date()
                  .toLocaleDateString("en-GB")
                  .replace(/\//g, "-"),
              },
            })
            .catch(() => null),
        ]);

      if (academicMonthResponse?.data?.success) {
        setCurrentAcademicMonth(academicMonthResponse.data.data);
      }

      if (studentsResponse.data.success) {
        const totalStudents =
          studentsResponse.data.meta?.totalRecords ??
          studentsResponse.data.data?.length ??
          0;
        const sessionsToday = sessionsResponse?.data?.success
          ? (sessionsResponse.data.data?.length ?? 0)
          : 0;

        setStats({
          myStudents: totalStudents,
          quranSessionsToday: sessionsToday,
        });
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch dashboard stats",
        error?.response?.data?.message,
      );
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(true), getHuffazAttendanceCount()]);
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const ActionButton = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
        <IconButton icon={icon} iconColor="#fff" size={24} />
      </View>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar.Icon
            size={50}
            icon="account-circle"
            style={{ backgroundColor: "#2196F3" }}
          />
          <View style={styles.headerTextContainer}>
            <Title style={styles.headerTitle}>Salaam,</Title>
            <Text style={styles.headerSubtitle}>
              {user?.fullName || "Huffaz Dashboard"}
            </Text>
          </View>
        </View>
        <IconButton
          icon="logout"
          iconColor="#F44336"
          size={24}
          onPress={handleLogout}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh()}
            colors={[colors.primary]} // Android spinner color
            progressBackgroundColor={colors.elevation.level2} // Android card background
            tintColor={colors.primary} // iOS spinner color
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <Card
                style={[styles.statCardSmall, { backgroundColor: "#FFF3E0" }]}
              >
                <Card.Content style={styles.statContentSmall}>
                  <IconButton
                    icon="calendar-check"
                    iconColor="#FF9800"
                    size={30}
                    style={{ margin: 0 }}
                  />
                  <Text style={styles.statValueSmall}>
                    {attendanceCount !== null ? attendanceCount : 0}
                  </Text>
                  <Text style={styles.statLabelSmall}>
                    This Month's Attendance Count
                  </Text>
                </Card.Content>
              </Card>
              <Card
                style={[styles.statCardSmall, { backgroundColor: "#E8F5E9" }]}
              >
                <Card.Content style={styles.statContentSmall}>
                  <IconButton
                    icon="account-group"
                    iconColor="#4CAF50"
                    size={30}
                    style={{ margin: 0 }}
                  />
                  <Text style={styles.statValueSmall}>{stats.myStudents}</Text>
                  <Text style={styles.statLabelSmall}>My Students</Text>
                </Card.Content>
              </Card>
            </View>
            <View style={styles.statsRow}>
              <Card
                style={[styles.statCardSmall, { backgroundColor: "#E3F2FD" }]}
              >
                <Card.Content style={styles.statContentSmall}>
                  <IconButton
                    icon="book-open-page-variant"
                    iconColor="#2196F3"
                    size={30}
                    style={{ margin: 0 }}
                  />
                  <Text style={styles.statValueSmall}>
                    {stats.quranSessionsToday}
                  </Text>
                  <Text style={styles.statLabelSmall}>Sessions Today</Text>
                </Card.Content>
              </Card>
            </View>

            <Title style={styles.sectionTitle}>Daily Tasks</Title>
            <View style={styles.actionsContainer}>
              <ActionButton
                title="Mark Attendance"
                icon="calendar-check"
                color="#009688"
                onPress={() => navigation.navigate("MarkAttendance")}
              />
              {/* <ActionButton
                title="Record Session"
                icon="book-open-variant"
                color="#FF9800"
                onPress={() => navigation.navigate("StudentList")} // Route to student list to select a student for recording
              /> */}
              <ActionButton
                title="My Students"
                icon="account-group"
                color="#3F51B5"
                onPress={() => navigation.navigate("StudentList")}
              />
              <ActionButton
                title="My Monthly Settlement"
                icon="cash-multiple"
                color="#4CAF50"
                onPress={() => navigation.navigate("MyMonthlySettlement")}
              />
              <ActionButton
                title="My Attendance List"
                icon="calendar-multiple-check"
                color="#FF5722"
                onPress={() =>
                  navigation.navigate("HuffazAttendanceList", {
                    academicMonth: currentAcademicMonth,
                  })
                } // Pass null to show current month by default
              />
              <ActionButton
                title="My Profile"
                icon="card-account-details"
                color="#607D8B"
                onPress={() => navigation.navigate("Profile")}
              />
              <ActionButton
                title="Academic Year"
                icon="calendar-range"
                color="#3EB73A"
                onPress={() => navigation.navigate("AcademicPeriodList")}
              />
              <ActionButton
                title="Academic Month"
                icon="calendar-month"
                color="#795548"
                onPress={() => navigation.navigate("AcademicMonthList")}
              />

            <Title style={styles.sectionTitle}>Recent Sessions</Title>
            <Card style={styles.activityCard}>
              <Card.Content>
                <Text
                  style={{
                    color: "#666",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  No sessions recorded today.
                </Text>
              </Card.Content>
            </Card>
          </>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 26,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#777",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  statsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCardSmall: {
    width: "48%",
    borderRadius: 12,
    elevation: 2,
  },
  statContentSmall: {
    alignItems: "center",
    paddingVertical: 15,
  },
  statValueSmall: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabelSmall: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 15,
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  activityCard: {
    elevation: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
  },
});
