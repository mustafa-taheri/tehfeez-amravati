import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Appbar,
  Card,
  Text,
  ActivityIndicator,
  useTheme,
  Avatar,
  Divider,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import apiClient from "../../api/client";
import { forcedLightTheme } from "../../../App";
import DropdownSelect from "react-native-input-select";

export default function HuffazPayableListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [payables, setPayables] = useState<any[]>([]);
  const [academicMonths, setAcademicMonths] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchPayables();
    } else {
      setPayables([]);
    }
  }, [selectedMonth]);

  const academicMonthsOptions = academicMonths.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  const fetchMonths = async () => {
    try {
      const response = await apiClient.get("/academic-months/periods/months");
      if (response.data.success) {
        setAcademicMonths(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedMonth(
            response.data.data[response.data.data.length - 1].id,
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch months", error);
    }
  };

  const fetchPayables = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get(`/finance/payables`, {
        params: { academicMonthId: selectedMonth },
      });

      if (response.data.success) {
        setPayables(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch payables", error?.response?.data?.message);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    if (!selectedMonth) return;
    setRefreshing(true);
    await fetchPayables(true);
    setRefreshing(false);
  }, [selectedMonth]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <Avatar.Text
              size={40}
              label={item.fullName.charAt(0)}
              style={{ backgroundColor: colors.primary }}
            />
            <View style={styles.info}>
              <Text style={styles.huffazName}>{item.fullName}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Attendance</Text>
              <Text style={styles.statValue}>{item.attendanceDays} days</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Calculated</Text>
              <Text style={styles.statValue}>{item.attendancePercentage}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Payable</Text>
              <Text style={[styles.statValue, { color: "#4CAF50" }]}>
                ₹{item.calculatedAmount}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <PaperProvider theme={forcedLightTheme}>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header mode="small" style={styles.appBar}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Huffaz Payables" />
          </Appbar.Header>

          <View style={styles.container}>
            <DropdownSelect
              label={"Select Academic Month"}
              options={academicMonthsOptions}
              selectedValue={selectedMonth}
              onValueChange={(value) => setSelectedMonth(value)}
            />

            {loading ? (
              <ActivityIndicator size="large" style={styles.loader} />
            ) : (
              <>
                <View style={styles.rowBetween}>
                  <Text style={styles.amountLabel}>
                    {`Daily Pool of this Month`}
                  </Text>
                  <Text style={styles.amountLabel}>
                    ₹ {payables?.dailyPool ?? 0}
                  </Text>
                </View>

                <FlatList
                  data={payables?.huffazPayables}
                  keyExtractor={(item, index) =>
                    item.userId || index.toString()
                  }
                  renderItem={renderItem}
                  contentContainerStyle={styles.list}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      No payables data found for this month.
                    </Text>
                  }
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={() => onRefresh()}
                      colors={[colors.primary]}
                      progressBackgroundColor={colors.elevation.level2}
                      tintColor={colors.primary}
                    />
                  }
                />
              </>
            )}
          </View>
        </SafeAreaView>
      </Portal.Host>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { flex: 1, padding: 16 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  loader: { marginTop: 20 },
  list: { paddingBottom: 30 },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  cardContent: { padding: 12 },
  header: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 12 },
  huffazName: { fontSize: 16, fontWeight: "bold" },
  subText: { fontSize: 12, color: "#666" },
  divider: { marginVertical: 12 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { alignItems: "center", flex: 1 },
  statLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 6,
    padding: 5,
    alignItems: "center",
  },
  amountLabel: {
    marginTop: 6,
    color: "#555",
    fontSize: 15,
  },
});
