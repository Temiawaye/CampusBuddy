import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/auth';
import { db } from '../../firebaseConfig';

interface Assignment {
  title: string;
  description: string;
  deadline: Date;
  course: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export default function Assignments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<Assignment>({
    title: '',
    description: '',
    deadline: new Date(),
    course: '',
    priority: 'Medium',
    status: 'Not Started',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const handleSubmit = async () => {
    if (!user) return;

    // Check for empty fields
    if (!assignment.title.trim() || !assignment.course.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'users', user.uid, 'assignments'), {
        ...assignment,
        createdAt: new Date(),
      });
      router.replace({
        pathname: '/(tabs)/tasks',
        params: { filter: 'assignments' }
      });
    } catch (error) {
      console.error('Error adding assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const newDate = new Date(assignment.deadline);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setAssignment({ ...assignment, deadline: newDate });
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDate = new Date(assignment.deadline);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setAssignment({ ...assignment, deadline: newDate });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container} className='mt-10'>
      <View style={styles.form}>
        <Text style={styles.title}>Add Assignment</Text>
        
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={assignment.title}
          onChangeText={(text) => setAssignment({ ...assignment, title: text })}
          placeholder="Enter assignment title"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={assignment.description}
          onChangeText={(text) => setAssignment({ ...assignment, description: text })}
          placeholder="Enter assignment description"
          multiline
          numberOfLines={4}
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Course</Text>
        <TextInput
          style={styles.input}
          value={assignment.course}
          onChangeText={(text) => setAssignment({ ...assignment, course: text })}
          placeholder="Enter course name"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Deadline</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={[styles.dateTimeButton, { flex: 1, marginRight: 8 }]}
            onPress={() => {
              setPickerMode('date');
              setShowDatePicker(true);
            }}
          >
            <Text>{formatDate(assignment.deadline)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateTimeButton, { flex: 1, marginLeft: 8 }]}
            onPress={() => {
              setPickerMode('time');
              setShowTimePicker(true);
            }}
          >
            <Text>{formatTime(assignment.deadline)}</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={assignment.deadline}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={assignment.deadline}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}

        <Text style={styles.label}>Priority</Text>
        <View style={styles.prioritySelector}>
          {(['Low', 'Medium', 'High'] as const).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityButton,
                assignment.priority === priority && styles.selectedPriority,
              ]}
              onPress={() => setAssignment({ ...assignment, priority })}
            >
              <Text style={[
                styles.priorityText,
                assignment.priority === priority && styles.selectedPriorityText,
              ]}>
                {priority}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusSelector}>
          {(['Not Started', 'In Progress', 'Completed'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                assignment.status === status && styles.selectedStatus,
              ]}
              onPress={() => setAssignment({ ...assignment, status })}
            >
              <Text style={[
                styles.statusText,
                assignment.status === status && styles.selectedStatusText,
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} className={`text-white  ${loading ? 'bg-gray-400' : 'bg-blue-500'}`} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText} >Add Assignment</Text>
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
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dateTimeButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: '#007AFF',
  },
  priorityText: {
    color: '#333333',
  },
  selectedPriorityText: {
    color: '#FFFFFF',
  },
  statusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedStatus: {
    backgroundColor: '#007AFF',
  },
  statusText: {
    color: '#333333',
  },
  selectedStatusText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 