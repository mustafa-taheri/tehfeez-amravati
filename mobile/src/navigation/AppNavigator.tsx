import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

// Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import AdminDashboardScreen from "../screens/Admin/AdminDashboardScreen";
import HuffazDashboardScreen from "../screens/Huffaz/HuffazDashboardScreen";
import MarkAttendanceScreen from "../screens/Attendance/MarkAttendanceScreen";
import StudentListScreen from "../screens/Student/StudentListScreen";
import StudentDetailScreen from "../screens/Student/StudentDetailScreen";
import RecordSessionScreen from "../screens/Student/RecordSessionScreen";
import FinanceReportScreen from "../screens/Admin/FinanceReportScreen";
import HuffazListScreen from "../screens/Admin/HuffazListScreen";
import HuffazFormScreen from "../screens/Admin/HuffazFormScreen";
import StudentFormScreen from "../screens/Admin/StudentFormScreen";
import AttendanceReportScreen from "../screens/Admin/AttendanceReportScreen";
import MyMonthlySettlementScreen from "../screens/Huffaz/MyMonthlySettlementScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, userToken, userRole } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // No token found, user isn't signed in
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // User is signed in
          <Stack.Group>
            {userRole === "ADMIN" ? (
              <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
              />
            ) : (
              <Stack.Screen
                name="HuffazDashboard"
                component={HuffazDashboardScreen}
              />
            )}

            {/* Common Routes for Admin and Huffaz */}
            <Stack.Screen
              name="MarkAttendance"
              component={MarkAttendanceScreen}
            />
            <Stack.Screen name="StudentList" component={StudentListScreen} />
            <Stack.Screen
              name="StudentDetail"
              component={StudentDetailScreen}
            />
            <Stack.Screen
              name="RecordSession"
              component={RecordSessionScreen}
            />
            <Stack.Screen
              name="FinanceReport"
              component={FinanceReportScreen}
            />
            <Stack.Screen name="HuffazList" component={HuffazListScreen} />
            <Stack.Screen name="HuffazForm" component={HuffazFormScreen} />
            <Stack.Screen name="StudentForm" component={StudentFormScreen} />
            <Stack.Screen
              name="AttendanceReport"
              component={AttendanceReportScreen}
            />
            <Stack.Screen
              name="MyMonthlySettlement"
              component={MyMonthlySettlementScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
