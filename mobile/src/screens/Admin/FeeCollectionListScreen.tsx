import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  Appbar,
  Card,
  Text,
  ActivityIndicator,
  useTheme,
  Avatar,
  FAB,
  Portal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import apiClient from "../../api/client";
import { forcedLightTheme } from "../../../App";
import DropdownSelect from "react-native-input-select";

export default function FeeCollectionListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [academicMonths, setAcademicMonths] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<any>("");
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchCollections();
    } else {
      setCollections([]);
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

  const fetchCollections = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get(`/finance/fee-collections`, {
        params: { academicMonthId: selectedMonth },
      });
      if (response.data.success) {
        setCollections(response.data.data);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch fee collections",
        error?.response?.data?.message,
      );
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    if (!selectedMonth) return;
    setRefreshing(true);
    await fetchCollections(true);
    setRefreshing(false);
  }, [selectedMonth]);

  const renderItem = ({ item }: { item: any }) => {
    const isPaid = item.paymentStatus === "PAID";
    const statusColor = isPaid
      ? "#4CAF50"
      : item.paymentStatus === "UNPAID"
        ? "#F44336"
        : "#FF9800";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("FeeCollectionDetail", { collectionId: item.id })
        }
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Avatar.Text
              size={48}
              label={item.student.firstName.charAt(0)}
              style={{ backgroundColor: colors.primary }}
            />
            <View style={styles.info}>
              <Text style={styles.studentName}>{item.student.fullName}</Text>
              <Text style={styles.subText}>ITS: {item.student.itsNumber}</Text>
              <Text style={styles.subText}>Fee: ₹{item.configuredFee}</Text>
            </View>
            <View style={styles.rightInfo}>
              <Text style={[styles.amount, { color: statusColor }]}>
                ₹{item.outstandingAmount}
              </Text>
              <Text style={styles.amountLabel}>Outstanding</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + "20" },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.paymentStatus}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <PaperProvider theme={forcedLightTheme}>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header
            mode="small"
            statusBarHeight={0}
            style={[styles.appBar, { height: 60 }]}
          >
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Fee Collections" />
          </Appbar.Header>

          <View style={styles.container}>
            <DropdownSelect
              label={"Select Academic Month"}
              options={academicMonthsOptions}
              selectedValue={selectedMonth}
              onValueChange={setSelectedMonth}
            />
            {loading ? (
              <ActivityIndicator size="large" style={styles.loader} />
            ) : (
              <FlatList
                data={collections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    No fee collections for this month.
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
            )}

            <FAB
              icon="plus"
              style={[styles.fab, { backgroundColor: colors.primary }]}
              color="#fff"
              onPress={() => navigation.navigate("FeeCollectionForm")}
            />
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
  list: { paddingBottom: 80 },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 16 },
  studentName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  subText: { fontSize: 12, color: "#666" },
  rightInfo: { alignItems: "flex-end" },
  amount: { fontSize: 16, fontWeight: "bold" },
  amountLabel: { fontSize: 10, color: "#888", marginBottom: 4 },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
