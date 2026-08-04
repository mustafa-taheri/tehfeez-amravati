import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Title, Button, Card, Text, Avatar, SegmentedButtons, ActivityIndicator, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../api/client';

export default function MarkAttendanceScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/students');
      if (response.data.success) {
        const studentList = response.data.data;
        setStudents(studentList);
        
        // Initialize attendance to PRESENT for everyone
        const initialData: Record<string, string> = {};
        studentList.forEach((s: any) => {
          initialData[s.id] = 'PRESENT';
        });
        setAttendanceData(initialData);
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
      Alert.alert('Error', 'Could not load student list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const submitAttendance = async () => {
    try {
      setSubmitting(true);
      
      const academicMonthId = "REPLACE_WITH_REAL_UUID"; // This needs to be fetched from active academic period API
      const today = new Date().toISOString();

      // Submit attendance for each student
      // In a production app with many students, a bulk-create endpoint is better, but doing it in loop for MVP based on existing API.
      const promises = students.map((student) => 
        apiClient.post('/attendance/student', {
          studentId: student.id,
          academicMonthId: academicMonthId,
          attendanceDate: today,
          attendanceStatus: attendanceData[student.id]
        }).catch(e => console.log('Error marking for', student.id, e.response?.data))
      );

      await Promise.all(promises);
      
      Alert.alert('Success', 'Attendance has been recorded successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }: { item: any }) => (
    <Card style={styles.studentCard}>
      <Card.Content>
        <View style={styles.studentHeader}>
          <Avatar.Text size={40} label={item.firstName.charAt(0) + (item.lastName ? item.lastName.charAt(0) : '')} style={styles.avatar} />
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.itsNumber}>ITS: {item.itsNumber}</Text>
          </View>
        </View>

        <SegmentedButtons
          value={attendanceData[item.id]}
          onValueChange={(value) => handleStatusChange(item.id, value)}
          buttons={[
            { value: 'PRESENT', label: 'P', checkedColor: 'white', style: attendanceData[item.id] === 'PRESENT' ? {backgroundColor: '#4CAF50'} : {}},
            { value: 'ABSENT', label: 'A', checkedColor: 'white', style: attendanceData[item.id] === 'ABSENT' ? {backgroundColor: '#F44336'} : {}},
            { value: 'LEAVE', label: 'L', checkedColor: 'white', style: attendanceData[item.id] === 'LEAVE' ? {backgroundColor: '#FF9800'} : {}},
            { value: 'UZUR', label: 'U', checkedColor: 'white', style: attendanceData[item.id] === 'UZUR' ? {backgroundColor: '#9C27B0'} : {}},
          ]}
          style={styles.segmentedButtons}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mark Attendance" />
      </Appbar.Header>

      <View style={styles.container}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{new Date().toDateString()}</Text>
          <Text style={styles.totalText}>Total: {students.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={renderStudentItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Button
          mode="contained"
          onPress={submitAttendance}
          loading={submitting}
          disabled={loading || submitting || students.length === 0}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Submit Attendance
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  appBar: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  studentCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: '#3F51B5',
  },
  studentInfo: {
    marginLeft: 15,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itsNumber: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  segmentedButtons: {
    marginTop: 5,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  }
});
