import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/auth';
import { db } from '../../firebaseConfig';

interface ClassSchedule {
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClassSchedule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ClassSchedule>({
    name: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    location: '',
    instructor: '',
  });

  const handleSubmit = async () => {
    if (!user) return;

    // Check for empty fields
    if (!schedule.name.trim() || !schedule.startTime.trim() || !schedule.endTime.trim() || 
        !schedule.location.trim() || !schedule.instructor.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'users', user.uid, 'classes'), {
        ...schedule,
        createdAt: new Date(),
      });
      router.replace({
        pathname: '/(tabs)/tasks',
        params: { filter: 'Classes' }
      });
    } catch (error) {
      console.error('Error adding class:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} className='mt-10'>
      <View style={styles.form}>
        <Text style={styles.title}>Add Class Schedule</Text>
        
        <Text style={styles.label}>Class Name</Text>
        <TextInput
          style={styles.input}
          value={schedule.name}
          onChangeText={(text) => setSchedule({ ...schedule, name: text })}
          placeholder="Enter class name"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Day</Text>
        <View style={styles.daySelector}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                schedule.day === day && styles.selectedDay,
              ]}
              onPress={() => setSchedule({ ...schedule, day })}
            >
              <Text style={[
                styles.dayText,
                schedule.day === day && styles.selectedDayText,
              ]}>
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Start Time</Text>
        <TextInput
          style={styles.input}
          value={schedule.startTime}
          onChangeText={(text) => setSchedule({ ...schedule, startTime: text })}
          placeholder="HH:MM AM/PM"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>End Time</Text>
        <TextInput
          style={styles.input}
          value={schedule.endTime}
          onChangeText={(text) => setSchedule({ ...schedule, endTime: text })}
          placeholder="HH:MM AM/PM"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={schedule.location}
          onChangeText={(text) => setSchedule({ ...schedule, location: text })}
          placeholder="Enter class location"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Instructor</Text>
        <TextInput
          style={styles.input}
          value={schedule.instructor}
          onChangeText={(text) => setSchedule({ ...schedule, instructor: text })}
          placeholder="Enter instructor name"
          placeholderTextColor="#666"
        />

        <TouchableOpacity style={styles.submitButton} className={`text-white  ${loading ? 'bg-gray-400' : 'bg-blue-500'}`} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>Add Class</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    minWidth: 45,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 