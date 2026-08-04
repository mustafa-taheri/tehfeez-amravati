import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Avatar, IconButton, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/client';

export default function HuffazDashboardScreen({ navigation }: any) {
  const { signOut } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myStudents: 0,
    quranSessionsToday: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // In a real scenario, this would be a specific huffaz dashboard endpoint
      const response = await apiClient.get('/students');
      if (response.data.success) {
        setStats({
          myStudents: response.data.meta.totalRecords || 0,
          quranSessionsToday: 0, // Mocked for now
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const ActionButton = ({ title, icon, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
        <IconButton icon={icon} iconColor="#fff" size={24} />
      </View>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar.Icon size={50} icon="account-circle" style={{ backgroundColor: '#2196F3' }} />
          <View style={styles.headerTextContainer}>
            <Title style={styles.headerTitle}>Salaam,</Title>
            <Text style={styles.headerSubtitle}>Huffaz Dashboard</Text>
          </View>
        </View>
        <IconButton icon="logout" iconColor="#F44336" size={24} onPress={handleLogout} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <Card style={[styles.statCardSmall, { backgroundColor: '#E8F5E9' }]}>
                <Card.Content style={styles.statContentSmall}>
                  <IconButton icon="account-group" iconColor="#4CAF50" size={30} style={{ margin: 0 }} />
                  <Text style={styles.statValueSmall}>{stats.myStudents}</Text>
                  <Text style={styles.statLabelSmall}>My Students</Text>
                </Card.Content>
              </Card>

              <Card style={[styles.statCardSmall, { backgroundColor: '#E3F2FD' }]}>
                <Card.Content style={styles.statContentSmall}>
                  <IconButton icon="book-open-page-variant" iconColor="#2196F3" size={30} style={{ margin: 0 }} />
                  <Text style={styles.statValueSmall}>{stats.quranSessionsToday}</Text>
                  <Text style={styles.statLabelSmall}>Sessions Today</Text>
                </Card.Content>
              </Card>
            </View>

            <Title style={styles.sectionTitle}>Daily Tasks</Title>
            <View style={styles.actionsContainer}>
              <ActionButton 
                title="Mark Attendance" 
                icon="calendar-check" 
                color="#009688" 
                onPress={() => navigation.navigate('MarkAttendance')} 
              />
              <ActionButton 
                title="Record Session" 
                icon="book-open-variant" 
                color="#FF9800" 
                onPress={() => navigation.navigate('StudentList')} // Route to student list to select a student for recording
              />
              <ActionButton 
                title="My Students" 
                icon="account-group" 
                color="#3F51B5" 
                onPress={() => navigation.navigate('StudentList')} 
              />
              <ActionButton 
                title="My Profile" 
                icon="card-account-details" 
                color="#607D8B" 
                onPress={() => console.log('Navigate to My Profile')} 
              />
            </View>

            <Title style={styles.sectionTitle}>Recent Sessions</Title>
            <Card style={styles.activityCard}>
              <Card.Content>
                <Text style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No sessions recorded today.</Text>
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 26,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCardSmall: {
    width: '48%',
    borderRadius: 12,
    elevation: 2,
  },
  statContentSmall: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  statValueSmall: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabelSmall: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 15,
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  activityCard: {
    elevation: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
  }
});
