import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Appbar,
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function MyMonthlySettlementScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [settlement, setSettlement] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const fetchMySettlement = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
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

      const response = await apiClient.get("/finance/payables/me", {
        params: { academicMonthId: academicMonth.id },
      });

      if (!response.data?.success) {
        setError(
          response.data?.message || "Unable to load your monthly settlement.",
        );
        return;
      }

      setSettlement(response.data.data);
    } catch (fetchError: any) {
      console.error(
        "fetchMySettlement error:",
        fetchError?.response?.data?.message,
      );
      setError("Failed to load your monthly settlement. Please try again.");
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySettlement();
  }, []);

  const renderSummaryCard = (title: string, value: string | number) => (
    <Card style={styles.summaryCard}>
      <Card.Content>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </Card.Content>
    </Card>
  );

  const settlementStatus =
    settlement?.academicMonth?.settlementStatus || "DRAFT";
  const statusMap = {
    DRAFT: {
      label: "Draft",
      tone: "#F57C00",
      bg: "#FFF3E0",
      text: "This month is still being calculated.",
    },
    GENERATED: {
      label: "Generated",
      tone: "#1976D2",
      bg: "#E3F2FD",
      text: "Payout has been generated for review.",
    },
    LOCKED: {
      label: "Locked",
      tone: "#2E7D32",
      bg: "#E8F5E9",
      text: "Settlement is finalized and locked.",
    },
  } as const;
  const statusMeta =
    statusMap[settlementStatus as keyof typeof statusMap] || statusMap.DRAFT;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMySettlement(true);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header
        mode="small"
        statusBarHeight={0}
        style={[styles.appBar, { height: 60 }]}
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Monthly Settlement" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.container}
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
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              mode="contained"
              onPress={() => fetchMySettlement()}
              style={styles.retryButton}
            >
              Retry
            </Button>
          </View>
        ) : settlement ? (
          <>
            <Card style={styles.primaryCard}>
              <Card.Content>
                <Text style={styles.label}>Academic Month</Text>
                <Title style={styles.primaryTitle}>
                  {settlement.academicMonth.name} (
                  {settlement.academicMonth.monthNumber}/
                  {settlement.academicMonth.year})
                </Title>
                <Text style={styles.amountText}>
                  ₹ {settlement.myPayable?.calculatedAmount ?? 0}
                </Text>
                <Text style={styles.amountLabel}>Estimated monthly payout</Text>

                <View
                  style={[
                    styles.statusBadgeContainer,
                    { backgroundColor: statusMeta.bg },
                  ]}
                >
                  <Text style={styles.statusLabel}>Settlement status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusMeta.tone },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {statusMeta.label}
                    </Text>
                  </View>
                  <Text style={styles.statusText}>{statusMeta.text}</Text>
                </View>

                <Card style={styles.breakdownCard}>
                  <Card.Content style={styles.breakdownContent}>
                    <Text style={styles.breakdownTitle}>
                      Recent payout breakdown
                    </Text>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownKey}>Attendance</Text>
                      <Text style={styles.breakdownValue}>
                        {settlement.myPayable?.attendanceDays ?? 0} days
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownKey}>Daily pool</Text>
                      <Text style={styles.breakdownValue}>
                        ₹ {settlement.dailyPool ?? 0}
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownKey}>Estimated payout</Text>
                      <Text style={styles.breakdownValue}>
                        ₹ {settlement.myPayable?.calculatedAmount ?? 0}
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownKey}>Attendance %</Text>
                      <Text style={styles.breakdownValue}>
                        {settlement.myPayable?.attendancePercentage ?? 0}%
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </Card.Content>
            </Card>

            <View style={styles.summaryRow}>
              {renderSummaryCard(
                "Attendance Days",
                settlement.myPayable?.attendanceDays ?? 0,
              )}
              {renderSummaryCard(
                "Attendance %",
                `${settlement.myPayable?.attendancePercentage ?? 0}%`,
              )}
            </View>

            <View style={styles.summaryRow}>
              {renderSummaryCard(
                "Daily Pool",
                `₹ ${settlement.dailyPool ?? 0}`,
              )}
              {renderSummaryCard(
                "Working Days",
                settlement.academicMonth.workingDays ?? 0,
              )}
            </View>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Attendance Summary</Title>
                <Divider style={styles.divider} />
                <View style={styles.row}>
                  <Text>Total Records</Text>
                  <Text>{settlement.attendanceSummary?.totalRecords ?? 0}</Text>
                </View>
                <View style={styles.row}>
                  <Text>Total Days</Text>
                  <Text>{settlement.attendanceSummary?.totalDays ?? 0}</Text>
                </View>
                {Object.entries(
                  settlement.attendanceSummary?.statusCounts || {},
                ).map(([status, count]: [string, any]) => (
                  <View key={status} style={styles.row}>
                    <Text>{status}</Text>
                    <Text>{count}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No settlement data available.</Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 15,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 10,
  },
  primaryCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    color: "#4CAF50",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadgeContainer: {
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  statusText: {
    marginTop: 8,
    fontSize: 13,
    color: "#444",
  },
  breakdownCard: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  breakdownContent: {
    paddingVertical: 4,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  breakdownKey: {
    fontSize: 13,
    color: "#666",
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
  },
  primaryTitle: {
    fontSize: 22,
    marginTop: 8,
  },
  amountText: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  amountLabel: {
    marginTop: 6,
    color: "#555",
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
  },
});
