import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Title, Appbar, ActivityIndicator, Text, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileScreen({ navigation }: any) {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber ?? "");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/auth/me");
      if (response.data.success) {
        const fetchedProfile = response.data.data;
        setProfile(fetchedProfile);
        setFirstName(fetchedProfile.firstName || "");
        setLastName(fetchedProfile.lastName || "");
        setEmail(fetchedProfile.email || "");
        setMobileNumber(fetchedProfile.mobileNumber || "");
        setProfileImage(fetchedProfile.profileImage || "");
      } else {
        setError(response.data.message || "Unable to load profile.");
      }
    } catch (fetchError: any) {
      console.error("fetchProfile error:", fetchError);
      setError("Unable to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Validation", "Please fill in your first and last name.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.put("/auth/profile", {
        firstName,
        lastName,
        email: email || null,
        mobileNumber: mobileNumber || null,
        profileImage: profileImage || null,
      });

      if (response.data.success) {
        const updatedProfile = response.data.data;
        const updatedUser = {
          ...updatedProfile,
          fullName:
            updatedProfile.fullName ||
            `${updatedProfile.firstName ?? ""} ${updatedProfile.lastName ?? ""}`.trim(),
        };
        updateUser(updatedUser);
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        Alert.alert("Error", response.data.message || "Could not update profile.");
      }
    } catch (updateError: any) {
      console.error("saveProfile error:", updateError);
      Alert.alert(
        "Error",
        updateError.response?.data?.message || "Could not update profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Profile" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" style={styles.loading} />
        ) : (
          <>
            <View style={styles.avatarRow}>
              <Avatar.Image
                size={96}
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require("../../../assets/pngegg.png")
                }
                style={styles.avatar}
              />
              <View style={styles.avatarTextContainer}>
                <Title>{user?.fullName || "My Profile"}</Title>
                <Text>{user?.username}</Text>
              </View>
            </View>

            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={styles.field}
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={styles.field}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              style={styles.field}
            />
            <TextInput
              label="Mobile Number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.field}
            />
            <TextInput
              label="Profile Image URL"
              value={profileImage}
              onChangeText={setProfileImage}
              mode="outlined"
              style={styles.field}
            />
            <Button
              mode="contained"
              onPress={saveProfile}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
            >
              Save Profile
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("ChangePassword")}
              style={styles.changePasswordButton}
            >
              Change Password
            </Button>
          </>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  appBar: { backgroundColor: "#fff", elevation: 2 },
  container: { padding: 20, paddingBottom: 40 },
  loading: { marginTop: 60 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: { backgroundColor: "#2196F3" },
  avatarTextContainer: { marginLeft: 16 },
  field: { marginBottom: 16, backgroundColor: "#fff" },
  saveButton: { marginTop: 10, borderRadius: 8 },
  changePasswordButton: { marginTop: 12, borderRadius: 8 },
  errorText: { color: "#D32F2F", textAlign: "center", marginTop: 16 },
});
