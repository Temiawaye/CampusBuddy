import { useRefresh } from '@/context/RefreshContext';
import { auth, db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
}

export default function CalendarViewScreen() {
  const { refreshKey, triggerRefresh } = useRefresh();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const user = auth.currentUser;

  const fetchTasks = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view tasks');
      return;
    }

    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(query(
        collection(db, 'todos'),
        where('userId', '==', user.uid),
        orderBy('deadline', 'asc')
      ));
      
      const tasksList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Task[];
      
      setTasks(tasksList);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'todos', taskId), {
        completed: !currentStatus
      });
      setTimeout(() => triggerRefresh(), 100);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, refreshKey]);

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    tasks.forEach(task => {
      const dateStr = task.deadline.toISOString().split('T')[0];
      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dotColor: task.completed ? 'green' : 'blue'
        };
      }
    });
    return marked;
  };

  const getTasksForSelectedDate = () => {
    return tasks.filter(task => {
      const taskDate = task.deadline.toISOString().split('T')[0];
      return taskDate === selectedDate;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-500 shadow-red-500';
      case 'medium':
        return 'bg-green-100 border-green-500 shadow-green-500';
      case 'low':
        return 'bg-yellow-100 border-yellow-500 shadow-yellow-500';
      default:
        return 'bg-gray-100 border-gray-500 shadow-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Please log in to view tasks</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold">Calendar</Text>
        <TouchableOpacity
          onPress={() => router.push('/tasks/new')}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">New Task</Text>
        </TouchableOpacity>
      </View>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        theme={{
          todayTextColor: '#2563EB',
          selectedDayBackgroundColor: '#2563EB',
          selectedDayTextColor: '#ffffff',
        }}
      />

      <ScrollView className="flex-1 p-4">
        {isLoading ? (
          <Text className="text-center mt-8 text-gray-500">Loading tasks...</Text>
        ) : getTasksForSelectedDate().length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 text-lg">No tasks for this date</Text>
            <TouchableOpacity
              onPress={() => router.push('/tasks/new')}
              className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Create New Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          getTasksForSelectedDate().map((task) => (
            <View
              key={task.id}
              className={`mb-4 p-4 rounded-lg border-l-4 shadow-xl ${getPriorityColor(task.priority)} ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text className="text-gray-600 mt-1">{task.description}</Text>
                  )}
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-500 ml-1">
                      Due: {formatTime(task.deadline)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => toggleTaskCompletion(task.id, task.completed)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                >
                  {task.completed && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
} 