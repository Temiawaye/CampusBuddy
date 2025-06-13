import { useRefresh } from '@/context/RefreshContext';
import { auth, db } from '@/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Task {
  id: string;
  title: string;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
}

export default function HomeScreen() {
  const { refreshKey } = useRefresh();
  const [userNames, setUserNames] = useState<string[]>([]);
  const [todayTasksCount, setTodayTasksCount] = useState(0);
  const [upcomingTasksCount, setUpcomingTasksCount] = useState(0);
  const [todayClassesCount, setTodayClassesCount] = useState(0);
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState(0);
  const [priorityTasks, setPriorityTasks] = useState<Task[]>([]);
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        router.replace('/auth/login');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!user) return;
      try {
        const userQuery = query(
          collection(db, 'user', user.uid, 'userNames'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(userQuery);
        const names = querySnapshot.docs.map((doc) => doc.data().name);
        setUserNames(names);
      } catch (error) {
        console.error('Error fetching user name:', error);
        Alert.alert('Error', 'Failed to load user information');
      }
    };
    fetchUserNames();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch today's tasks
        const todayQuery = query(
          collection(db,'users', user.uid, 'tasks'),
          where('userId', '==', user.uid),
          where('deadline', '>=', today),
          where('deadline', '<', tomorrow),
          orderBy('deadline', 'asc')
        );
        const todaySnapshot = await getDocs(todayQuery);
        setTodayTasksCount(todaySnapshot.size);

        // Fetch upcoming tasks
        const upcomingQuery = query(
          collection(db, 'users', user.uid, 'tasks'),
          where('userId', '==', user.uid),
          where('deadline', '>=', tomorrow),
          orderBy('deadline', 'asc')
        );
        const upcomingSnapshot = await getDocs(upcomingQuery);
        setUpcomingTasksCount(upcomingSnapshot.size);

        // Fetch today's classes
        const todayClassesQuery = query(
          collection(db, 'users', user.uid, 'classes'),
          where('day', '==', today.toLocaleDateString('en-US', { weekday: 'long' }))
        );
        const todayClassesSnapshot = await getDocs(todayClassesQuery);
        setTodayClassesCount(todayClassesSnapshot.size);

        // Fetch pending assignments
        const pendingAssignmentsQuery = query(
          collection(db, 'users', user.uid, 'assignments'),
          where('status', 'in', ['Not Started', 'In Progress']),
          where('deadline', '>=', today),
          orderBy('deadline', 'asc')
        );
        const pendingAssignmentsSnapshot = await getDocs(pendingAssignmentsQuery);
        setPendingAssignmentsCount(pendingAssignmentsSnapshot.size);

        // Fetch priority tasks for today
        const priorityQuery = query(
          collection(db, 'users', user.uid, 'tasks'),
          where('userId', '==', user.uid),
          where('deadline', '>=', today),
          where('deadline', '<', tomorrow),
          where('priority', 'in', ['high', 'medium']),
          orderBy('priority', 'desc'),
          orderBy('deadline', 'asc'),
          limit(3)
        );
        const prioritySnapshot = await getDocs(priorityQuery);
        const tasks = prioritySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          deadline: doc.data().deadline.toDate()
        })) as Task[];
        setPriorityTasks(tasks);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, refreshKey]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Please log in to view your tasks</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 pt-3">
      <View className="p-6">
        <Text className="text-2xl font-bold mb-6">Welcome Back! {userNames[0] || 'User'}</Text>
        
        {/* Quick Stats */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/(tabs)/tasks',
              params: { filter: 'today' }
            })}
            className="flex-1 min-w-[45%]"
          >
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-gray-500">Today's Tasks</Text>
              <Text className="text-2xl font-bold">{loading ? '...' : todayTasksCount}</Text>
            </View>
          </TouchableOpacity>
            
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/(tabs)/tasks',
              params: { filter: 'upcoming' }
            })}
            className="flex-1 min-w-[45%]"
          >
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-gray-500">Upcoming</Text>
              <Text className="text-2xl font-bold">{loading ? '...' : upcomingTasksCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/(tabs)/tasks',
              params: { filter: 'classes' }
            })}
            className="flex-1 min-w-[45%]"
          >
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-gray-500">Today's Classes</Text>
              <Text className="text-2xl font-bold">{loading ? '...' : todayClassesCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '/(tabs)/tasks',
              params: { filter: 'assignments' }
            })}
            className="flex-1 min-w-[45%]"
          >
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-gray-500">Pending Assignments</Text>
              <Text className="text-2xl font-bold">{loading ? '...' : pendingAssignmentsCount}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/tasks/new')}
              className="flex-1 bg-purple-500 p-4 rounded-lg"
            >
              <View className="items-center">
                <FontAwesome name="plus" size={24} color="white" />
                <Text className="text-white font-semibold mt-2">New Task</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/tasks/class-schedule')}
              className="flex-1 bg-blue-500 p-4 rounded-lg"
            >
              <View className="items-center">
                <FontAwesome name="calendar" size={24} color="white" />
                <Text className="text-white font-semibold mt-2">Add Class</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/tasks/assignments')}
              className="flex-1 bg-green-500 py-4 px-2 rounded-lg"
            >
              <View className="items-center">
                <FontAwesome name="tasks" size={24} color="white" />
                <Text className="text-white font-semibold mt-2">Add Assignment</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Priority Tasks */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Priority Tasks</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            {loading ? (
              <Text className="text-gray-500 text-center">Loading tasks...</Text>
            ) : priorityTasks.length > 0 ? (
              priorityTasks.map((task) => (
                <TouchableOpacity 
                  key={task.id}
                  onPress={() => router.push('/tasks')}
                  className="flex-row items-center justify-between mb-3 last:mb-0"
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-3 h-3 ${getPriorityColor(task.priority)} rounded-full mr-2`} />
                    <Text className="font-medium flex-1">{task.title}</Text>
                  </View>
                  <Text className="text-gray-500 ml-2">{formatDate(task.deadline)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-gray-500 text-center">No priority tasks for today</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 