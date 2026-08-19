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
  Paragraph,
  Avatar,
  IconButton,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/client";

export default function AdminDashboardScreen({ navigation }: any) {
  const { signOut, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    // Fetch stats on mount
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const [studentsResponse, attendanceResponse] = await Promise.all([
        apiClient.get("/students"),
        apiClient
          .get("/attendance/student", {
            params: {
              attendanceDate: new Date()
                .toLocaleDateString("en-GB")
                .replace(/\//g, "-"),
            },
          })
          .catch(() => null),
      ]);

      if (studentsResponse.data.success) {
        const totalStudents =
          studentsResponse.data.meta?.totalRecords ??
          studentsResponse.data.data?.length ??
          0;
        const attendanceRecords = attendanceResponse?.data?.success
          ? (attendanceResponse.data.data ?? [])
          : [];
        const presentToday = attendanceRecords.filter(
          (record: any) => record.attendanceStatus === "PRESENT",
        ).length;
        const absentToday = Math.max(totalStudents - presentToday, 0);

        setStats({
          totalStudents,
          presentToday,
          absentToday,
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
    await fetchDashboardStats(true);
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card
      style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
    >
      <Card.Content style={styles.statContent}>
        <View style={styles.statTextContainer}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
        <Avatar.Icon
          size={48}
          icon={icon}
          style={{ backgroundColor: color + "20" }}
          color={color}
        />
      </Card.Content>
    </Card>
  );

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
        <View>
          <Title style={styles.headerTitle}>Admin Overview</Title>
          <Text style={styles.headerSubtitle}>
            Welcome back, {user?.fullName || "System Admin"}
          </Text>
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
            <Title style={styles.sectionTitle}>Today's Snapshot</Title>
            <View style={styles.statsContainer}>
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon="account-group"
                color="#4CAF50"
              />
              <StatCard
                title="Present Today"
                value={stats.presentToday}
                icon="check-circle"
                color="#2196F3"
              />
              <StatCard
                title="Absent Today"
                value={stats.absentToday}
                icon="close-circle"
                color="#F44336"
              />
            </View>

            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.actionsContainer}>
              <ActionButton
                title="Manage Students"
                icon="account-edit"
                color="#9C27B0"
                onPress={() => navigation.navigate("StudentList")}
              />
              <ActionButton
                title="Mark Huffaz Attendance"
                icon="calendar-check"
                color="#009688"
                onPress={() => navigation.navigate("MarkHuffazAttendance")}
              />
              <ActionButton
                title="Manage Huffaz"
                icon="account-tie"
                color="#FF9800"
                onPress={() => navigation.navigate("HuffazList")}
              />
              <ActionButton
                title="Attendance Report"
                icon="calendar-text"
                color="#3F51B5"
                onPress={() => navigation.navigate("AttendanceReport")}
              />
              <ActionButton
                title="Reports"
                icon="chart-bar"
                color="#673AB7"
                onPress={() => navigation.navigate("FinanceReport")}
              />
              <ActionButton
                title="Academic Month"
                icon="calendar-month"
                color="#795548"
                onPress={() => navigation.navigate("AcademicMonthForm")}
              />
              <ActionButton
                title="Fee Configs"
                icon="cash-edit"
                color="#FF5722"
                onPress={() => navigation.navigate("MarhalaFeeConfigList")}
              />
              <ActionButton
                title="Fee Collections"
                icon="cash-register"
                color="#00BCD4"
                onPress={() => navigation.navigate("FeeCollectionList")}
              />
              <ActionButton
                title="Settlements"
                icon="bank-transfer"
                color="#607D8B"
                onPress={() => navigation.navigate("SettlementList")}
              />
              <ActionButton
                title="Huffaz Payables"
                icon="wallet"
                color="#E91E63"
                onPress={() => navigation.navigate("HuffazPayableList")}
              />
            </View>

            <Title style={styles.sectionTitle}>Recent Activity</Title>
            <Card style={styles.activityCard}>
              <Card.Content>
                <Text
                  style={{
                    color: "#666",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  No recent activity to show.
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
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#777",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 15,
    marginTop: 10,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
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
