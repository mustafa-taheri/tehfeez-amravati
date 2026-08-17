import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  Title,
  Text,
  Appbar,
  ActivityIndicator,
  Card,
  Button,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function AttendanceReportScreen({ navigation, route }: any) {
  const studentId = route.params?.studentId;
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [monthName, setMonthName] = useState<string>("");

  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const monthResponse = await apiClient.get("/academic-months/current");
      if (!monthResponse.data.success) {
        return;
      }
      const academicMonth = monthResponse.data.data;
      setMonthName(
        `${academicMonth.name} (${academicMonth.monthNumber}/${academicMonth.year})`,
      );

      const params: any = { academicMonthId: academicMonth.id };
      if (studentId) {
        params.studentId = studentId;
      }
      const response = await apiClient.get("/attendance/student", { params });
      if (response.data.success) {
        const attendance = response.data.data || [];
        setRecords(attendance);
        const counts = attendance.reduce((acc: any, item: any) => {
          acc[item.attendanceStatus] = (acc[item.attendanceStatus] || 0) + 1;
          return acc;
        }, {});
        setSummary(counts);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch attendance",
        error?.response?.data?.message,
      );
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAttendance(true);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Attendance Report" />
      </Appbar.Header>
      <ScrollView
        style={styles.container}
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
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            <Card style={styles.headerCard}>
              <Card.Content>
                <Title style={styles.title}>Attendance Summary</Title>
                <Text style={styles.subtitle}>{monthName}</Text>
                {studentId && <Text>Student attendance view</Text>}
              </Card.Content>
            </Card>

            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text>Total Records</Text>
                  <Text style={styles.summaryValue}>{records.length}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text>PRESENT</Text>
                  <Text style={styles.summaryValue}>
                    {summary.PRESENT || 0}
                  </Text>
                </Card.Content>
              </Card>
            </View>
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text>UZUR</Text>
                  <Text style={styles.summaryValue}>{summary.UZUR || 0}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text>ABSENT</Text>
                  <Text style={styles.summaryValue}>{summary.ABSENT || 0}</Text>
                </Card.Content>
              </Card>
            </View>

            <Title style={styles.listTitle}>Records</Title>
            <FlatList
              data={records}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.recordCard}>
                  <Card.Content>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordDate}>
                        {item.attendanceDate}
                      </Text>
                      <Text>{item.attendanceStatus}</Text>
                    </View>
                    {item.remarks ? <Text>Note: {item.remarks}</Text> : null}
                  </Card.Content>
                </Card>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No attendance records found.
                </Text>
              }
              contentContainerStyle={styles.listContent}
            />

            <Button
              mode="contained"
              onPress={() => fetchAttendance()}
              style={styles.reloadButton}
            >
              Refresh
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { flex: 1, padding: 16 },
  headerCard: { marginBottom: 16, borderRadius: 14, elevation: 2 },
  title: { fontSize: 18, fontWeight: "bold" },
  subtitle: { color: "#666", marginTop: 4 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryCard: { flex: 1, marginRight: 10, borderRadius: 12, elevation: 2 },
  summaryValue: { fontSize: 20, fontWeight: "bold", marginTop: 8 },
  listTitle: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  recordCard: { marginBottom: 12, borderRadius: 12, elevation: 1 },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  recordDate: { fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },
  listContent: { paddingBottom: 30 },
  reloadButton: { marginTop: 10, borderRadius: 8 },
});
