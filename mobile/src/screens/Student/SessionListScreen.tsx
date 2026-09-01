import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

const SessionListScreen = ({ route, navigation }: any) => {
  const { studentId } = route.params;
  const [loading, setLoading] = useState(true);
  const [quranSessions, setRecentSessions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    setPage(1);
    fetchQuranSessions(1, false);
  }, []);

  const fetchQuranSessions = async (pageNum = 1, isRefreshing = false) => {
    console.log("called");

    try {
      if (!isRefreshing && pageNum === 1) setLoading(true);
      if (pageNum > 1) setIsFetchingMore(true);
      const response = await apiClient.get(
        `/quran-sessions?page=${pageNum}&pageSize=20&studentId=${studentId}`,
      );
      //   console.log(response.data);

      if (response.data.success) {
        if (pageNum === 1) {
          setRecentSessions(response.data.data);
        } else {
          setRecentSessions((prev) => [...prev, ...response.data.data]);
        }
        setHasNextPage(response.data.meta?.hasNextPage || false);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch recent sessions",
        error?.response?.data?.message,
      );
    } finally {
      if (!isRefreshing && pageNum === 1) setLoading(false);
      if (pageNum > 1) setIsFetchingMore(false);
    }
  };

  const renderSessionItems = ({ item: session }: { item: any }) => {
    return (
      <Card style={styles.sessionCard}>
        <Card.Content>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionDate}>
              {new Date(session?.sessionDate).toDateString()}
            </Text>
            <View style={styles.sessionTypeBadge}>
              <Text style={styles.sessionTypeText}>{session?.sessionType}</Text>
            </View>
          </View>
          <Divider style={styles.dividerSmall} />
          <View style={styles.sessionDetails}>
            {session?.siparaNumber && (
              <Text style={styles.sessionDetail}>
                Sipara: {session?.siparaNumber}
              </Text>
            )}
            {session?.surahName && (
              <Text style={styles.sessionDetail}>
                Surah: {session?.surahName}
              </Text>
            )}
          </View>
          <View style={styles.sessionDetails}>
            {session?.hifzProgress && (
              <Text style={styles.sessionDetail}>
                Progress: {session?.hifzProgress}
              </Text>
            )}
            {session?.remarks && (
              <Text style={styles.sessionDetail}>Note: {session.remarks}</Text>
            )}
          </View>
          <View style={styles.sessionDetails}>
            {session?.murajaahJuz && (
              <Text style={styles.sessionDetail}>
                Murajaa Juz: {session?.murajaahJuz}
              </Text>
            )}
            {session?.murajaahMarks && (
              <Text style={styles.sessionDetail}>
                Murajaa Marks: {session.murajaahMarks}
              </Text>
            )}
          </View>

          {session?.huffaz && (
            <Text
              style={[
                styles.sessionDetail,
                { fontStyle: "italic", marginTop: 5 },
              ]}
            >
              Recorded By:{" "}
              {`${session?.huffaz?.firstName} ${session?.huffaz?.lastName}`}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchQuranSessions(1, true);
    setRefreshing(false);
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchQuranSessions(nextPage, false);
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
        <Appbar.Content title="Quran Sessions" />
      </Appbar.Header>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={quranSessions}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator
                  style={{ margin: 20 }}
                  color={colors.primary}
                />
              ) : null
            }
            keyExtractor={(item) => item.id}
            renderItem={(item) => renderSessionItems(item)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={{ textAlign: "center", color: "#888" }}>
                    No sessions recorded yet.
                  </Text>
                </Card.Content>
              </Card>
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
      </View>
    </SafeAreaView>
  );
};

export default SessionListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  appBar: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
  },
  sessionCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: {
    fontWeight: "bold",
    color: "#333",
  },
  sessionTypeBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sessionTypeText: {
    color: "#2196F3",
    fontSize: 11,
    fontWeight: "bold",
  },
  dividerSmall: {
    marginVertical: 8,
  },
  sessionDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },
});
