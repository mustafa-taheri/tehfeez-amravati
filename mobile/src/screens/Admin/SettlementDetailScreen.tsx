import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Appbar,
  Card,
  Title,
  Text,
  ActivityIndicator,
  Button,
  useTheme,
  Divider,
  Modal,
  Portal,
  TextInput,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import apiClient from "../../api/client";
import { forcedLightTheme } from "../../../App";
import DropdownSelect from "react-native-input-select";

export default function SettlementDetailScreen({ navigation, route }: any) {
  const { settlementId } = route.params;
  const [loading, setLoading] = useState(true);
  const [settlement, setSettlement] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  // Adjustment Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState("");
  const [adjType, setAdjType] = useState("BONUS");
  const adjTypeOptions = [
    { label: "Bonus", value: "BONUS" },
    { label: "Deduction", value: "DEDUCTION" },
  ];
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [submittingAdj, setSubmittingAdj] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [settlementId]);

  const fetchDetail = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await apiClient.get(
        `/finance/settlements/${settlementId}`,
      );
      if (response.data.success) {
        setSettlement(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settlement detail", error);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDetail(true);
    setRefreshing(false);
  }, []);

  const handleLock = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        `/finance/settlements/${settlementId}/lock`,
      );
      if (response.data.success) {
        alert("Settlement Locked successfully!");
        fetchDetail();
      } else {
        alert(response.data.message || "Failed to lock.");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const submitAdjustment = async () => {
    if (!selectedDetailId || !adjAmount || !adjReason) return;
    setSubmittingAdj(true);
    try {
      const response = await apiClient.post(
        `/finance/settlements/${settlementId}/details/${selectedDetailId}/adjustments`,
        {
          adjustmentType: adjType,
          amount: parseFloat(adjAmount),
          reason: adjReason,
        },
      );
      if (response.data.success) {
        setModalVisible(false);
        fetchDetail();
      } else {
        alert(response.data.message || "Failed to add adjustment.");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "An error occurred.");
    } finally {
      setSubmittingAdj(false);
    }
  };

  const openAdjustmentModal = (detailId: string) => {
    setSelectedDetailId(detailId);
    setAdjType("BONUS");
    setAdjAmount("");
    setAdjReason("");
    setModalVisible(true);
  };

  if (loading && !refreshing && !settlement) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!settlement) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Appbar.Header mode="small" style={styles.appBar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Settlement Details" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text>Settlement not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLocked = settlement.settlementStatus === "LOCKED";

  return (
    <PaperProvider theme={forcedLightTheme}>
      <Portal.Host>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <Appbar.Header mode="small" style={styles.appBar}>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Settlement Details" />
          </Appbar.Header>

          <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
          >
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.rowBetween}>
                  <Title>{settlement.academicMonth.name}</Title>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: isLocked ? "#4CAF50" : "#2196F3",
                    }}
                  >
                    {settlement.settlementStatus}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.rowBetween}>
                  <Text>Total Students:</Text>
                  <Text style={styles.bold}>{settlement.totalStudents}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text>Total Configured Fees:</Text>
                  <Text style={styles.bold}>
                    ₹{settlement.totalConfiguredFees}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text>Total Collected Amount:</Text>
                  <Text style={[styles.bold, { color: "#4CAF50" }]}>
                    ₹{settlement.totalCollectedAmount}
                  </Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text>Total Payable Pool:</Text>
                  <Text style={[styles.bold, { color: "#F44336" }]}>
                    ₹{settlement.totalPayablePool}
                  </Text>
                </View>

                {!isLocked && (
                  <Button
                    mode="contained"
                    onPress={handleLock}
                    style={styles.lockButton}
                    icon="lock"
                  >
                    Lock Settlement
                  </Button>
                )}
              </Card.Content>
            </Card>

            <Title style={styles.sectionTitle}>Huffaz Details</Title>
            {settlement.monthlySettlementDetails?.map((detail: any) => (
              <Card key={detail.id} style={styles.detailCard}>
                <Card.Content>
                  <Text style={styles.huffazName}>{detail.user?.fullName}</Text>
                  <Text style={styles.subText}>
                    Days: {detail.attendanceDays} ({detail.attendancePercentage}
                    %)
                  </Text>

                  <View style={styles.rowBetween}>
                    <Text>Calculated:</Text>
                    <Text>₹{detail.calculatedAmount}</Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text>Bonus:</Text>
                    <Text style={{ color: "#4CAF50" }}>
                      +₹{detail.bonusAmount}
                    </Text>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text>Deduction:</Text>
                    <Text style={{ color: "#F44336" }}>
                      -₹{detail.deductionAmount}
                    </Text>
                  </View>
                  <Divider style={{ marginVertical: 6 }} />
                  <View style={styles.rowBetween}>
                    <Text style={styles.bold}>Final Payable:</Text>
                    <Text style={[styles.bold, { fontSize: 16 }]}>
                      ₹{detail.finalPayableAmount}
                    </Text>
                  </View>

                  {!isLocked && (
                    <Button
                      mode="text"
                      onPress={() => openAdjustmentModal(detail.id)}
                      style={styles.adjButton}
                    >
                      Add Adjustment
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))}
          </ScrollView>

          <Portal>
            <Modal
              visible={modalVisible}
              onDismiss={() => setModalVisible(false)}
              contentContainerStyle={styles.modalContainer}
            >
              <Title style={{ marginBottom: 10 }}>Add Adjustment</Title>

              <DropdownSelect
                label={"Adjustment Type"}
                options={adjTypeOptions}
                selectedValue={adjType}
                onValueChange={(value) => setAdjType()}
              />
              <TextInput
                label="Amount (₹)"
                value={adjAmount}
                onChangeText={setAdjAmount}
                keyboardType="numeric"
                mode="outlined"
                style={{ marginBottom: 12 }}
              />

              <TextInput
                label="Reason"
                value={adjReason}
                onChangeText={setAdjReason}
                mode="outlined"
                style={{ marginBottom: 20 }}
              />

              <View style={styles.modalActions}>
                <Button onPress={() => setModalVisible(false)}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={submitAdjustment}
                  loading={submittingAdj}
                >
                  Submit
                </Button>
              </View>
            </Modal>
          </Portal>
        </SafeAreaView>
      </Portal.Host>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16, backgroundColor: "#fff", borderRadius: 12 },
  detailCard: { marginBottom: 12, backgroundColor: "#fff" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  bold: { fontWeight: "bold" },
  divider: { marginVertical: 10 },
  lockButton: { marginTop: 16, backgroundColor: "#F44336" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  huffazName: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  subText: { fontSize: 12, color: "#666", marginBottom: 8 },
  adjButton: { alignSelf: "flex-end", marginTop: -5 },

  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 12,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
});
