import { auth, db } from '@/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface Todo {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  time: Date;
}

interface Class {
  id: string;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch todos
      const todosQuery = query(
        collection(db, 'users', user.uid, 'tasks'),
        // where('userId', '==', user.uid),
        orderBy('deadline', 'asc')
      );
      const todosSnapshot = await getDocs(todosQuery);
      const todosList = todosSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          deadline: data.deadline?.toDate?.() || new Date(),
          time: data.time?.toDate?.() || new Date(),
          completed: data.completed || false,
          priority: data.priority || 'medium'
        };
      }) as Todo[];
      setTodos(todosList);

      // Fetch classes
      const classesQuery = query(
        collection(db, 'users', user.uid, 'classes'),
        orderBy('day', 'asc')
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classesList = classesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Class[];
      setClasses(classesList);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTask = ({ item }: { item: Todo }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-lg mb-3 shadow-sm"
      onPress={() => router.push('/tasks')}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(item.priority)}`} />
          <View className="flex-1">
            <Text className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
              {item.title}
            </Text>
            {item.description && (
              <Text className="text-gray-500 text-sm">{item.description}</Text>
            )}
            <Text className="text-gray-500 text-sm">{formatTime(item.time)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderClass = ({ item }: { item: Class }) => (
    <TouchableOpacity 
      className="bg-blue-50 p-4 rounded-lg mb-3 shadow-sm border border-blue-200"
      onPress={() => router.push('/tasks/class-schedule')}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-3 h-3 rounded-full mr-2 bg-blue-500" />
          <View className="flex-1">
            <Text className="font-medium text-blue-900">{item.name}</Text>
            <Text className="text-blue-700 text-sm">{item.instructor}</Text>
            <Text className="text-blue-600 text-sm">
              {item.startTime} - {item.endTime}
            </Text>
            <Text className="text-blue-600 text-sm">{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    
    // Mark dates with todos
    todos.forEach(todo => {
      const dateStr = todo.deadline.toISOString().split('T')[0];
      if (!marked[dateStr]) {
        marked[dateStr] = { marked: true, dotColor: getPriorityColor(todo.priority) };
      }
    });

    // Mark dates with classes
    classes.forEach(cls => {
      const today = new Date();
      const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(cls.day);
      if (dayIndex !== -1) {
        const date = new Date();
        date.setDate(today.getDate() + (dayIndex - today.getDay() + 7) % 7);
        const dateStr = date.toISOString().split('T')[0];
        if (!marked[dateStr]) {
          marked[dateStr] = { marked: true, dotColor: '#3b82f6' };
        }
      }
    });

    if (selectedDate) {
      marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: '#3b82f6' };
    }
    return marked;
  };

  const getFilteredData = () => {
    if (!selectedDate) return { todos, classes: [] };

    const selectedDateObj = new Date(selectedDate);
    const selectedDay = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const filteredTodos = todos.filter(todo => {
      const todoDate = todo.deadline.toDateString();
      return todoDate === selectedDateObj.toDateString();
    });

    const filteredClasses = classes.filter(cls => cls.day === selectedDay);

    return { todos: filteredTodos, classes: filteredClasses };
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Please log in to view your tasks</Text>
      </View>
    );
  }

  const { todos: filteredTodos, classes: filteredClasses } = getFilteredData();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-6 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold">Calendar</Text>
      </View>
      <View className="p-4 mt-5 rounded-md">
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={getMarkedDates()}
          theme={{
            todayTextColor: '#3b82f6',
            selectedDayBackgroundColor: '#3b82f6',
            arrowColor: '#3b82f6',
          }}
        />
      </View>

      <View className="flex-1 px-4">
        <Text className="text-lg font-semibold mb-3">
          {selectedDate ? `Schedule for ${selectedDate}` : 'All Schedule'}
        </Text>
        {isLoading ? (
          <Text className="text-center text-gray-500 py-8">Loading...</Text>
        ) : (
          <FlatList
            data={[...filteredClasses, ...filteredTodos]}
            renderItem={({ item }) => {
              if ('day' in item) {
                return renderClass({ item: item as Class });
              }
              return renderTask({ item: item as Todo });
            }}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View className="py-8">
                <Text className="text-center text-gray-500">No items found</Text>
                <View className="flex-row justify-center mt-4 space-x-2">
                  <TouchableOpacity
                    onPress={() => router.push('/tasks/new')}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold">New Task</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/tasks/class-schedule')}
                    className="bg-green-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold">Add Class</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        )}
      </View>

      <View className="absolute bottom-6 right-6 flex-row space-x-2">
        <TouchableOpacity
          className="bg-green-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push('/tasks/class-schedule')}
        >
          <FontAwesome name="calendar" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push('/tasks/new')}
        >
          <FontAwesome name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 