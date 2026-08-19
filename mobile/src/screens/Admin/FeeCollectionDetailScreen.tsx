import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Appbar,
  Card,
  Title,
  Text,
  ActivityIndicator,
  Button,
  TextInput,
  useTheme,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";

export default function FeeCollectionDetailScreen({ navigation, route }: any) {
  const { collectionId } = route.params;
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [reference, setReference] = useState("");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [collectionId]);

  const fetchDetail = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      // We don't have a specific get by ID for fee collections,
      // but we can fetch all and filter, or add an endpoint.
      // Assuming GET /finance/fee-collections returns an array, let's fetch all and find it for now.
      const response = await apiClient.get(`/finance/fee-collections`);
      if (response.data.success) {
        const found = response.data.data.find(
          (c: any) => c.id === collectionId,
        );
        setCollection(found);
        if (found) {
          setPaymentAmount(found.outstandingAmount.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch fee collection detail", error);
    } finally {
      if (!isRefreshing) setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDetail(true);
    setRefreshing(false);
  }, []);

  const handleRecordPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setRecording(true);
    try {
      const payload = {
        studentId: collection?.studentId,
        academicMonthId: collection?.academicMonth?.id,
        studentFeeCollectionId: collectionId,
        amount: parseFloat(paymentAmount),
        paymentMode,
        referenceNumber: reference,
      };
      const response = await apiClient.post("/finance/fee-payment", payload);
      if (response.data.success) {
        setPaymentAmount("");
        setReference("");
        fetchDetail();
      } else {
        alert(response.data.message || "Failed to record payment.");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "An error occurred.");
    } finally {
      setRecording(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Appbar.Header style={styles.appBar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Fee Collection" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text>Collection not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPaid = collection.paymentStatus === "PAID";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Fee Details" />
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
            <Title>{collection.student.fullName}</Title>
            <Text style={styles.subText}>
              ITS: {collection?.student?.itsNumber}
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text>Academic Month:</Text>
              <Text style={styles.bold}>{collection?.academicMonth?.name}</Text>
            </View>
            <View style={styles.row}>
              <Text>Configured Fee:</Text>
              <Text style={styles.bold}>₹{collection?.configuredFee}</Text>
            </View>
            <View style={styles.row}>
              <Text>Discount:</Text>
              <Text style={styles.bold}>₹{collection?.discountAmount}</Text>
            </View>
            <View style={styles.row}>
              <Text>Waived:</Text>
              <Text style={styles.bold}>₹{collection?.waivedAmount}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.row}>
              <Text>Total Paid:</Text>
              <Text style={[styles.bold, { color: "#4CAF50" }]}>
                ₹{collection?.totalReceivedAmount}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>Outstanding:</Text>
              <Text
                style={[styles.bold, { color: isPaid ? "#4CAF50" : "#F44336" }]}
              >
                ₹{collection.outstandingAmount}
              </Text>
            </View>
            <View style={styles.row}>
              <Text>Status:</Text>
              <Text
                style={[styles.bold, { color: isPaid ? "#4CAF50" : "#F44336" }]}
              >
                {collection.paymentStatus}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {!isPaid && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={{ marginBottom: 10 }}>Record Payment</Title>
              <TextInput
                label="Amount (₹)"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Payment Mode (e.g., CASH, UPI)"
                value={paymentMode}
                onChangeText={setPaymentMode}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Reference Number (Optional)"
                value={reference}
                onChangeText={setReference}
                mode="outlined"
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleRecordPayment}
                loading={recording}
                disabled={recording}
                style={styles.button}
              >
                Record Payment
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 16, backgroundColor: "#fff", borderRadius: 12 },
  subText: { color: "#666", marginBottom: 8 },
  divider: { marginVertical: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bold: { fontWeight: "bold" },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  button: { marginTop: 8, borderRadius: 8, paddingVertical: 4 },
});
