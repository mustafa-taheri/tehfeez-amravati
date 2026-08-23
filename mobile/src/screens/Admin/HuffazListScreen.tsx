import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import {
  Title,
  Card,
  Text,
  Appbar,
  ActivityIndicator,
  Searchbar,
  Button,
  Avatar,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { RefreshControl } from "react-native";

export default function HuffazListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [huffazList, setHuffazList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchHuffaz();
  }, []);

  const fetchHuffaz = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get("/huffaz");
      if (response.data.success) {
        setHuffazList(response.data.data);
        setFiltered(response.data.data);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch huffaz list",
        error?.response?.data?.message,
      );
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFiltered(huffazList);
      return;
    }
    const lower = query.toLowerCase();
    setFiltered(
      huffazList.filter(
        (item) =>
          item.firstName.toLowerCase().includes(lower) ||
          item.lastName.toLowerCase().includes(lower) ||
          item.username.toLowerCase().includes(lower) ||
          item.email?.toLowerCase().includes(lower) ||
          item.mobileNumber.includes(query),
      ),
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHuffaz();
    setRefreshing(false);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("HuffazForm", { huffaz: item })}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Text
            size={48}
            label={item.firstName.charAt(0)}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.subText}>{item.username}</Text>
            <Text style={styles.subText}>
              {item.email || item.mobileNumber}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header mode="small" style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Manage Huffaz" />
      </Appbar.Header>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search Huffaz"
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchBar}
          elevation={2}
        />
        <Button
          mode="contained"
          onPress={() => navigation.navigate("HuffazForm", { huffaz: null })}
          style={styles.addButton}
        >
          Add Huffaz
        </Button>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No Huffaz found.</Text>
            }
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
  searchBar: { marginBottom: 12, borderRadius: 10, backgroundColor: "#fff" },
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
  avatar: { backgroundColor: "#3F51B5" },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  subText: { fontSize: 13, color: "#666" },
  statusBadge: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: { color: "#1A73E8", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },
});
