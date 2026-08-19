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
import ProfileScreen from "../screens/Auth/ProfileScreen";
import ChangePasswordScreen from "../screens/Auth/ChangePasswordScreen";
import AcademicMonthFormScreen from "../screens/Huffaz/AcademicMonthFormScreen";
import HuffazAttendanceScreen from "../screens/Huffaz/HuffazAttendanceScreen";
import MarkAttendanceScreenHuffaz from "../screens/Attendance/MarkAttendanceScreenHuffaz";
import MarkAttendanceScreenStudent from "../screens/Attendance/MarkAttendanceScreenStudent";

import MarhalaFeeConfigListScreen from "../screens/Admin/MarhalaFeeConfigListScreen";
import MarhalaFeeConfigFormScreen from "../screens/Admin/MarhalaFeeConfigFormScreen";
import FeeCollectionListScreen from "../screens/Admin/FeeCollectionListScreen";
import FeeCollectionFormScreen from "../screens/Admin/FeeCollectionFormScreen";
import FeeCollectionDetailScreen from "../screens/Admin/FeeCollectionDetailScreen";
import SettlementListScreen from "../screens/Admin/SettlementListScreen";
import SettlementDetailScreen from "../screens/Admin/SettlementDetailScreen";
import GenerateSettlementScreen from "../screens/Admin/GenerateSettlementScreen";
import HuffazPayableListScreen from "../screens/Admin/HuffazPayableListScreen";
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
              component={MarkAttendanceScreenStudent}
            />
            <Stack.Screen
              name="MarkHuffazAttendance"
              component={MarkAttendanceScreenHuffaz}
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
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <Stack.Screen
              name="AcademicMonthForm"
              component={AcademicMonthFormScreen}
            />
            <Stack.Screen
              name="HuffazAttendanceList"
              component={HuffazAttendanceScreen}
            />

            {/* New Features */}
            <Stack.Screen name="MarhalaFeeConfigList" component={MarhalaFeeConfigListScreen} />
            <Stack.Screen name="MarhalaFeeConfigForm" component={MarhalaFeeConfigFormScreen} />
            <Stack.Screen name="FeeCollectionList" component={FeeCollectionListScreen} />
            <Stack.Screen name="FeeCollectionForm" component={FeeCollectionFormScreen} />
            <Stack.Screen name="FeeCollectionDetail" component={FeeCollectionDetailScreen} />
            <Stack.Screen name="SettlementList" component={SettlementListScreen} />
            <Stack.Screen name="SettlementDetail" component={SettlementDetailScreen} />
            <Stack.Screen name="GenerateSettlement" component={GenerateSettlementScreen} />
            <Stack.Screen name="HuffazPayableList" component={HuffazPayableListScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
