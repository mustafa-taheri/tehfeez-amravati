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
  Button,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { useIsFocused } from "@react-navigation/native";

export default function SettlementListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchSettlements();
    }
  }, [isFocused]);

  const fetchSettlements = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get("/finance/settlements");
      if (response.data.success) {
        setSettlements(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settlements", error);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSettlements(true);
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    const isLocked = item.settlementStatus === "LOCKED";
    const statusColor = isLocked
      ? "#4CAF50"
      : item.settlementStatus === "GENERATED"
        ? "#2196F3"
        : "#FF9800";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("SettlementDetail", { settlementId: item.id })
        }
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Text style={styles.monthName}>{item.academicMonth?.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + "20" },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.settlementStatus}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Students</Text>
                <Text style={styles.statValue}>{item.totalStudents}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Collected</Text>
                <Text style={[styles.statValue, { color: "#4CAF50" }]}>
                  ₹{item.totalCollectedAmount}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Payable Pool</Text>
                <Text style={[styles.statValue, { color: "#F44336" }]}>
                  ₹{item.totalPayablePool}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header
        mode="small"
        statusBarHeight={0}
        style={[styles.appBar, { height: 60 }]}
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Monthly Settlements" />
      </Appbar.Header>

      <View style={styles.container}>
        <Button
          mode="contained"
          icon="calculator"
          style={styles.generateButton}
          onPress={() => navigation.navigate("GenerateSettlement")}
        >
          Generate Settlement
        </Button>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={settlements}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No settlements generated yet.
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { flex: 1, padding: 16 },
  generateButton: { marginBottom: 16, borderRadius: 8 },
  loader: { marginTop: 20 },
  list: { paddingBottom: 30 },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthName: { fontSize: 18, fontWeight: "bold" },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  statBox: { alignItems: "center" },
  statLabel: { fontSize: 11, color: "#888", marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },
});
