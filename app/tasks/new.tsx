import { useRefresh } from '@/context/RefreshContext';
import { auth, db } from '@/firebaseConfig';
// import { registerForPushNotificationsAsync, scheduleTaskNotification } from '@/utils/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NewTaskScreen() {
  const { triggerRefresh } = useRefresh();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [priority, setPriority] = useState('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        router.replace('/auth/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreateTask = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a task');
      return;
    }

    if (title.trim() === '') {
      setError('Please enter a task title');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Combine deadline and time
      const combinedDateTime = new Date(deadline);
      combinedDateTime.setHours(time.getHours());
      combinedDateTime.setMinutes(time.getMinutes());

      // Validate deadline is not in the past
      if (combinedDateTime < new Date()) {
        setError('Task deadline cannot be in the past');
        return;
      }

      const docRef = await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        title: title.trim(),
        description: description.trim(),
        deadline: combinedDateTime,
        priority,
        completed: false,
        userId: user.uid,
        createdAt: new Date()
      });

      // Trigger refresh to update all task lists
      setTimeout(() => triggerRefresh(), 100);

      // Schedule notification for the task
      // await scheduleTaskNotification(docRef.id, title.trim(), combinedDateTime);

      Alert.alert('Success', 'Task created successfully', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (selectedPriority: string) => {
    if (priority === selectedPriority) {
      switch (selectedPriority) {
        case 'low':
          return 'bg-green-500';
        case 'medium':
          return 'bg-yellow-500';
        case 'high':
          return 'bg-red-500';
      }
    }
    return 'bg-gray-200';
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Please log in to create tasks</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 mt-10">
      <View className="p-6">
        <Text className="text-2xl font-bold mb-6">Create New Task</Text>

        {error ? (
          <Text className="text-red-500 mb-4">{error}</Text>
        ) : null}

        <View className="space-y-4">
          <View>
            <Text className="text-gray-600 mb-2">Task Title</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200"
              placeholder="Enter task title"
              value={title}
              placeholderTextColor="#666"
              onChangeText={(text) => {
                setTitle(text);
                setError('');
              }}
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Description</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 h-24"
              placeholder="Enter task description"
              value={description}
              placeholderTextColor="#666"
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Deadline</Text>
            <TouchableOpacity
              className="bg-white p-4 rounded-lg border border-gray-200"
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{deadline.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDeadline(selectedDate);
                }}
              />
            )}
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Time</Text>
            <TouchableOpacity
              className="bg-white p-4 rounded-lg border border-gray-200"
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{time.toLocaleTimeString()}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}
          </View>

          <View>
            <Text className="text-gray-600 mb-2">Priority</Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg ${getPriorityColor('low')}`}
                onPress={() => setPriority('low')}
              >
                <Text className="text-center text-white">Low</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg ${getPriorityColor('medium')}`}
                onPress={() => setPriority('medium')}
              >
                <Text className="text-center text-white">Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-3 rounded-lg ${getPriorityColor('high')}`}
                onPress={() => setPriority('high')}
              >
                <Text className="text-center text-white">High</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`bg-blue-500 p-4 rounded-lg mt-6 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleCreateTask}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold">
              {isLoading ? 'Creating...' : 'Create Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
} 