import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Card,
  Text,
  Appbar,
  ActivityIndicator,
  useTheme,
  FAB,
  Chip,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { useIsFocused } from "@react-navigation/native";

export default function AcademicPeriodListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [periods, setPeriods] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchPeriods();
    }
  }, [isFocused]);

  const fetchPeriods = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get("/academic-months/periods");
      if (response.data.success) {
        setPeriods(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch periods", error?.response?.data?.message);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const renderPeriodItem = ({ item }: { item: any }) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate("AcademicPeriodForm", { period: item })
      }
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.nameText}>{item.name}</Text>
          <View style={styles.badgeContainer}>
            {item.isCurrent && (
              <Chip
                textStyle={{ color: "#fff" }}
                style={[styles.badge, { backgroundColor: colors.primary }]}
              >
                Current
              </Chip>
            )}
            <Chip
              textStyle={{ color: "#fff" }}
              style={[
                styles.badge,
                { backgroundColor: item.isActive ? "#4caf50" : "#f44336" },
              ]}
            >
              {item.isActive ? "Active" : "Inactive"}
            </Chip>
          </View>
        </View>
        <Text style={styles.dates}>
          {new Date(item.startDate).toLocaleDateString()} -{" "}
          {new Date(item.endDate).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPeriods(true);
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
        <Appbar.Content title="Academic Periods" />
      </Appbar.Header>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={periods}
            keyExtractor={(item) => item.id}
            renderItem={renderPeriodItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No academic periods found.</Text>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
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
          onPress={() =>
            navigation.navigate("AcademicPeriodForm", { period: null })
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { flex: 1, padding: 15 },
  loader: { flex: 1, justifyContent: "center" },
  listContent: { paddingBottom: 80 },
  card: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nameText: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1 },
  badgeContainer: { flexDirection: "row", gap: 5 },
  badge: { height: 35 },
  dates: { fontSize: 13, color: "#666" },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#888",
    fontSize: 16,
  },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0 },
});
