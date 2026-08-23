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

export default function StudentListScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get("/students");
      if (response.data.success) {
        setStudents(response.data.data);
        setFilteredStudents(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch students", error?.response?.data?.message);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const lowercased = query.toLowerCase();
      const filtered = students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(lowercased) ||
          (s.lastName && s.lastName.toLowerCase().includes(lowercased)) ||
          s.itsNumber.includes(query),
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
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
    await fetchStudents(true);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header mode="small" style={styles.appBar}>
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
            data={filteredStudents}
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
