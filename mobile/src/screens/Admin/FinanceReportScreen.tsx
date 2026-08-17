import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Title,
  Text,
  Card,
  Button,
  Appbar,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function FinanceReportScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const monthResponse = await apiClient.get("/academic-months/current");
      if (!monthResponse.data?.success) {
        setError("Unable to load the active academic month.");
        return;
      }

      const academicMonth = monthResponse.data.data;
      if (!academicMonth?.id) {
        setError("No active academic month found.");
        return;
      }

      const reportResponse = await apiClient.get("/finance/reports", {
        params: { academicMonthId: academicMonth.id },
      });

      if (!reportResponse.data?.success) {
        setError(
          reportResponse.data?.message || "Failed to load finance report.",
        );
        return;
      }

      setReport(reportResponse.data.data);
    } catch (fetchError: any) {
      console.error("fetchReport error:", fetchError?.response?.data?.message);
      setError("Failed to load finance report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryCard = (title: string, value: string | number) => (
    <Card style={styles.summaryCard}>
      <Card.Content>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Finance Report" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              mode="contained"
              onPress={fetchReport}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        ) : report ? (
          <>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Academic Month</Title>
              <Text style={styles.sectionSubtitle}>
                {report.academicMonth.name} ({report.academicMonth.monthNumber}/
                {report.academicMonth.year})
              </Text>
            </View>

            <View style={styles.summaryRow}>
              {renderSummaryCard("Total Students", report.totalStudents)}
              {renderSummaryCard(
                "Total Collected",
                `₹ ${report.totalCollectedAmount}`,
              )}
            </View>
            <View style={styles.summaryRow}>
              {renderSummaryCard(
                "Configured Fees",
                `₹ ${report.totalConfiguredFees}`,
              )}
              {renderSummaryCard("Daily Pool", `₹ ${report.dailyPool}`)}
            </View>
            <View style={styles.summaryRow}>
              {renderSummaryCard(
                "Discounts",
                `₹ ${report.totalDiscountAmount}`,
              )}
              {renderSummaryCard("Waivers", `₹ ${report.totalWaivedAmount}`)}
            </View>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Attendance Summary</Title>
                <Divider style={styles.divider} />
                <View style={styles.row}>
                  <Text>Total Records</Text>
                  <Text>{report.attendanceSummary.totalRecords}</Text>
                </View>
                <View style={styles.row}>
                  <Text>Total Days</Text>
                  <Text>{report.attendanceSummary.totalDays}</Text>
                </View>
                {Object.entries(report.attendanceSummary.statusCounts).map(
                  ([status, count]: [string, any]) => (
                    <View key={status} style={styles.row}>
                      <Text>{status}</Text>
                      <Text>{count}</Text>
                    </View>
                  ),
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Payables</Title>
                <Divider style={styles.divider} />
                {report.huffazPayables.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No Huffaz payables found.
                  </Text>
                ) : (
                  report.huffazPayables.map((payable: any) => (
                    <Card key={payable.userId} style={styles.payableCard}>
                      <Card.Content>
                        <View style={styles.payableHeader}>
                          <Text style={styles.payableName}>
                            {payable.fullName}
                          </Text>
                          <Text style={styles.payableAmount}>
                            ₹ {payable.calculatedAmount}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <Text>Attendance Days</Text>
                          <Text>{payable.attendanceDays}</Text>
                        </View>
                        <View style={styles.row}>
                          <Text>Attendance %</Text>
                          <Text>{payable.attendancePercentage}%</Text>
                        </View>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Fees by Marhala</Title>
                <Divider style={styles.divider} />
                {report.feeByMarhala.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No fee configuration data available.
                  </Text>
                ) : (
                  report.feeByMarhala.map((item: any) => (
                    <View key={item.marhalaName} style={styles.row}>
                      <Text>{item.marhalaName}</Text>
                      <Text>{item.studentCount} students</Text>
                    </View>
                  ))
                )}
              </Card.Content>
            </Card>
          </>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No report data available.</Text>
          </View>
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
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    marginRight: 10,
    minWidth: 150,
    backgroundColor: "#fff",
    elevation: 2,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 13,
    color: "#888",
  },
  summaryValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  payableCard: {
    marginTop: 16,
    backgroundColor: "#FAFAFA",
  },
  payableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  payableName: {
    fontWeight: "bold",
  },
  payableAmount: {
    fontWeight: "bold",
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  centered: {
    alignItems: "center",
    marginTop: 40,
  },
  errorText: {
    color: "#D32F2F",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
  },
});
