import React, { useState, useEffect, useContext } from "react";
import apiClient from "../../api/client";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Portal,
  Text,
} from "react-native-paper";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-paper-dropdown";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";

const HuffazAttendanceScreen = ({ navigation, route }: any) => {
  const { user } = useContext(AuthContext);
  const academicMonth = route.params?.academicMonth;
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [academicMonthsOptions, setAcademicMonthsOptions] = useState([]);
  const [selectedAcademicMonth, setSelectedAcademicMonth] = useState(
    academicMonth?.id,
  );

  useEffect(() => {
    fetchCurrentPeroidAcademicMonth();
  }, []);

  useEffect(() => {
    if (academicMonth) {
      fetchHuffazAttendanceList();
    }
  }, [academicMonth]);

  const fetchCurrentPeroidAcademicMonth = async () => {
    try {
      const response = await apiClient.get("/academic-months/periods/months");
      if (response.data.success) {
        // converting the response data to the format required by the dropdown (i.e. label and value)
        const formattedOptions = response.data.data.map((month: any) => ({
          label: month.name,
          value: month.id,
        }));
        setAcademicMonthsOptions(formattedOptions || []);
      } else {
        setError(
          response.data.message || "Unable to load current academic month.",
        );
      }
    } catch (fetchError: any) {
      console.error(
        "fetchCurrentAcademicMonth error:",
        fetchError?.response?.data?.message,
      );
      setError("Unable to load current academic month. Please try again.");
    }
  };

  const fetchHuffazAttendanceList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/attendance/huffaz", {
        params: { userId: user?.id, academicMonthId: selectedAcademicMonth },
      });
      if (response.data.success) {
        setAttendanceList(response.data.data || []);
      } else {
        setError(response.data.message || "Unable to load attendance list.");
      }
    } catch (fetchError) {
      console.error("fetchHuffazAttendanceList error:", fetchError);
      setError("Unable to load attendance list. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const renderAttendanceItem = ({ item }: { item: any }) => (
    <Card style={styles.attendanceCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.attendanceInfo}>
          <Text style={styles.attendanceStatus}>{item.attendanceStatus}</Text>
          <Text style={styles.attendanceDate}>Date: {item.attendanceDate}</Text>
          <Text style={styles.attendanceDate}>Remark: {item.remarks}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header style={styles.appBar}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Huffaz Attendance Screen" />
          </Appbar.Header>

          <View style={styles.container}>
            <View style={{ marginBottom: 20 }}>
              <Dropdown
                label="Select Academic Month"
                options={academicMonthsOptions}
                value={selectedAcademicMonth}
                onSelect={(value) => setSelectedAcademicMonth(value)}
                menuContentStyle={styles.field}
                mode="outlined"
              />
            </View>
            {/* </View>
      <View style={styles.container}> */}
            {loading ? (
              <ActivityIndicator size="large" style={styles.loader} />
            ) : (
              <FlatList
                data={attendanceList}
                keyExtractor={(item) => item.id}
                renderItem={renderAttendanceItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    No Attendance for selected month.
                  </Text>
                }
              />
            )}
          </View>
        </SafeAreaView>
      </Portal.Host>
    </PaperProvider>
  );
};

export default HuffazAttendanceScreen;

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
  container: {
    flex: 1,
    padding: 15,
    flexDirection: "column",
  },
  field: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  attendanceCard: {
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
  attendanceInfo: {
    marginLeft: 15,
    justifyContent: "center",
  },
  attendanceStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  attendanceDate: {
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
