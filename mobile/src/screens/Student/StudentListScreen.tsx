import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  Title,
  Card,
  Text,
  Avatar,
  Searchbar,
  Appbar,
  ActivityIndicator,
  Button,
  IconButton,
  useTheme,
  FAB,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { useIsFocused } from "@react-navigation/native";

export default function StudentListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (isFocused) {
      setPage(1);
      fetchStudents(1, false, debouncedSearchQuery);
    }
  }, [isFocused, debouncedSearchQuery]);

  const fetchStudents = async (pageNum = 1, isRefreshing = false, query = debouncedSearchQuery) => {
    try {
      if (!isRefreshing && pageNum === 1) setLoading(true);
      if (pageNum > 1) setIsFetchingMore(true);
      
      const response = await apiClient.get(`/students?page=${pageNum}&pageSize=20&search=${encodeURIComponent(query)}`);
      if (response.data.success) {
        if (pageNum === 1) {
          setStudents(response.data.data);
        } else {
          setStudents(prev => [...prev, ...response.data.data]);
        }
        setHasNextPage(response.data.meta?.hasNextPage || false);
      }
    } catch (error: any) {
      console.error("Failed to fetch students", error?.response?.data?.message);
    } finally {
      if (!isRefreshing && pageNum === 1) setLoading(false);
      if (pageNum > 1) setIsFetchingMore(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("StudentDetail", {
          studentId: item.id,
          student: item,
        })
      }
    >
      <Card style={styles.studentCard}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Text
            size={45}
            label={item.firstName.charAt(0)}
            style={styles.avatar}
          />
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.itsNumber}>ITS: {item.itsNumber}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchStudents(1, true, debouncedSearchQuery);
    setRefreshing(false);
  }, [debouncedSearchQuery]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStudents(nextPage, false, debouncedSearchQuery);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header
        mode="small"
        statusBarHeight={0}
        style={[styles.appBar, { height: 60 }]}
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Students" />
      </Appbar.Header>

      <View style={styles.container}>
        <Searchbar
          placeholder="Search by name or ITS"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          elevation={2}
        />

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={students}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ margin: 20 }} color={colors.primary} /> : null}
            keyExtractor={(item) => item.id}
            renderItem={renderStudentItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No students found.</Text>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]} // Android spinner color
                progressBackgroundColor={colors.elevation.level2} // Android card background
                tintColor={colors.primary} // iOS spinner color
              />
            }
          />
        )}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: colors.primary }]}
          color="#fff"
          onPress={() => navigation.navigate("StudentForm", { student: null })}
        />
      </View>
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
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  searchBar: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  studentCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#009688",
  },
  studentInfo: {
    marginLeft: 15,
    justifyContent: "center",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itsNumber: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#888",
    fontSize: 16,
  },
});
