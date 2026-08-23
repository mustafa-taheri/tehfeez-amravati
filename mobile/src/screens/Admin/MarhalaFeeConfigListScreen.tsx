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
  Button,
  useTheme,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function MarhalaFeeConfigListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get("/marhalas/fee-configs");
      if (response.data.success) {
        setConfigs(response.data.data);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch fee configs",
        error?.response?.data?.message,
      );
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConfigs(true);
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("MarhalaFeeConfigForm", { config: item })
      }
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <IconButton icon="cash-multiple" size={30} iconColor="#4CAF50" />
          </View>
          <View style={styles.info}>
            <Text style={styles.marhalaName}>{item.marhala?.name}</Text>
            <Text style={styles.subText}>
              Academic Period: {item.academicPeriod?.name}
            </Text>
            <Text style={styles.subText}>
              Effective: {new Date(item.effectiveFrom).toLocaleDateString()}
              {item.effectiveTo
                ? ` - ${new Date(item.effectiveTo).toLocaleDateString()}`
                : " (Ongoing)"}
            </Text>
          </View>
          <View style={styles.rightInfo}>
            <Text style={styles.feeAmount}>₹{item.monthlyFee}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.isActive ? "#E8F5E9" : "#FFEBEE" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: item.isActive ? "#2E7D32" : "#C62828" },
                ]}
              >
                {item.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header mode="small" style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Marhala Fee Configurations" />
      </Appbar.Header>

      <View style={styles.container}>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("MarhalaFeeConfigForm", { config: null })
          }
          style={styles.addButton}
          icon="plus"
        >
          Add Configuration
        </Button>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={configs}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No Fee Configurations found.</Text>
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
  addButton: { marginBottom: 16, borderRadius: 8 },
  loader: { marginTop: 20 },
  list: { paddingBottom: 30 },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  cardContent: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    backgroundColor: "#E8F5E9",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 16 },
  marhalaName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  subText: { fontSize: 12, color: "#666", marginBottom: 2 },
  rightInfo: { alignItems: "flex-end" },
  feeAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },
});
