import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/auth';
import { useRefresh } from '../../context/RefreshContext';
import { db } from '../../firebaseConfig';
// import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
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

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  course: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Not Started' | 'In Progress' | 'Completed';
  createdAt: Date;
}

type TaskFilter = 'upcoming' | 'completed' | 'uncompleted' | 'today' | 'all' | 'classes' | 'assignments';

export default function TasksScreen() {
  const { user } = useAuth();
  const { triggerRefresh } = useRefresh();
  const params = useLocalSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>(
    (params.filter as TaskFilter) || 'all'
  );

  const fetchData = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view tasks');
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch tasks
      const tasksQuery = query(
        collection(db,'users', user.uid, 'tasks'),
        // where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasksList = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Task[];
      setTasks(tasksList);

      // Fetch classes
      const classesQuery = query(
        collection(db, 'users', user.uid, 'classes'),
        orderBy('day', 'asc')
      );
      const classesSnapshot = await getDocs(classesQuery);
      const classesList = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Class[];
      setClasses(classesList);

      // Fetch assignments
      const assignmentsQuery = query(
        collection(db, 'users', user.uid, 'assignments'),
        orderBy('deadline', 'asc')
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentsList = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Assignment[];
      setAssignments(assignmentsList);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', user!.uid, 'tasks', taskId), {
        completed: !currentStatus
      });
      setTimeout(() => triggerRefresh(), 100);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const toggleAssignmentStatus = async (assignmentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
      await updateDoc(doc(db, 'users', user!.uid, 'assignments', assignmentId), {
        status: newStatus
      });
      setTimeout(() => triggerRefresh(), 100);
    } catch (error) {
      console.error('Error updating assignment:', error);
      Alert.alert('Error', 'Failed to update assignment status');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'users', user!.uid, 'tasks', taskId));
      setTimeout(() => triggerRefresh(), 100);
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const deleteClass = async (classId: string) => {
    try {
      await deleteDoc(doc(db, 'users', user!.uid, 'classes', classId));
      setTimeout(() => triggerRefresh(), 100);
    } catch (error) {
      console.error('Error deleting class:', error);
      Alert.alert('Error', 'Failed to delete class');
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      await deleteDoc(doc(db, 'users', user!.uid, 'assignments', assignmentId));
      setTimeout(() => triggerRefresh(), 100);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      Alert.alert('Error', 'Failed to delete assignment');
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, triggerRefresh]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'High':
        return 'bg-red-100 border-red-500 shadow-red-500';
      case 'medium':
      case 'Medium':
        return 'bg-green-100 border-green-500 shadow-green-500';
      case 'low':
      case 'Low':
        return 'bg-yellow-100 border-yellow-500 shadow-yellow-500';
      default:
        return 'bg-gray-100 border-gray-500 shadow-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeString}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeString}`;
    }
    
    return `${date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })} at ${timeString}`;
  };

  const getFilteredData = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });

    switch (selectedFilter) {
      case 'all':
        return { tasks, classes, assignments };
      case 'today':
        return {
          tasks: tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === now.getTime();
          }),
          classes: classes.filter(cls => cls.day === today),
          assignments: assignments.filter(assignment => {
            const assignmentDate = new Date(assignment.deadline);
            assignmentDate.setHours(0, 0, 0, 0);
            return assignmentDate.getTime() === now.getTime();
          })
        };
      case 'upcoming':
        return {
          tasks: tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            return !task.completed && taskDate >= now;
          }),
          classes: [],
          assignments: assignments.filter(assignment => {
            const assignmentDate = new Date(assignment.deadline);
            assignmentDate.setHours(0, 0, 0, 0);
            return assignment.status !== 'Completed' && assignmentDate >= now;
          })
        };
      case 'completed':
        return {
          tasks: tasks.filter(task => task.completed),
          classes: [],
          assignments: assignments.filter(assignment => assignment.status === 'Completed')
        };
      case 'uncompleted':
        return {
          tasks: tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);
            return !task.completed && taskDate < now;
          }),
          classes: [],
          assignments: assignments.filter(assignment => {
            const assignmentDate = new Date(assignment.deadline);
            assignmentDate.setHours(0, 0, 0, 0);
            return assignment.status !== 'Completed' && assignmentDate < now;
          })
        };
      case 'classes':
        return { tasks: [], classes, assignments: [] };
      case 'assignments':
        return { tasks: [], classes: [], assignments };
      default:
        return { tasks, classes, assignments };
    }
  };

  const FilterButton = ({ type, label }: { type: TaskFilter; label: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(type)}
      className={`py-2.5 px-4 mx-1.5 rounded-full shadow-lg ${
        selectedFilter === type 
          ? 'bg-blue-500 shadow-blue-900' 
          : 'bg-white shadow-gray-300'
      }`}
    >
      <Text
        className={`text-base font-semibold ${
          selectedFilter === type ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    const { tasks: filteredTasks, classes: filteredClasses, assignments: filteredAssignments } = getFilteredData();

    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      );
    }

    if (filteredTasks.length === 0 && filteredClasses.length === 0 && filteredAssignments.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-center">No items found</Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1 p-4">
        {filteredTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            className="mb-4"
            onPress={() => router.push('/tasks')}
          >
            <View className={`bg-white p-4 rounded-lg border-l-8 shadow-lg ${getPriorityColor(task.priority)}`}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(task.priority)}`} />
                  <View className="flex-1">
                    <Text className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text className="text-gray-500 text-sm">{task.description}</Text>
                    )}
                    <Text className="text-gray-500 text-sm">{formatDate(task.deadline)}</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => toggleTaskCompletion(task.id, task.completed)}
                    className="mr-2"
                  >
                    <Ionicons
                      name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={24}
                      color={task.completed ? '#10B981' : '#6B7280'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTask(task.id)}>
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredClasses.map((cls) => (
          <TouchableOpacity
            key={cls.id}
            className="mb-4"
            disabled={true}
          >
            <View className="bg-blue-50 p-4 rounded-lg shadow-lg shadow-blue-300">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-3 h-3 rounded-full mr-2 bg-blue-500" />
                  <View className="flex-1">
                    <Text className="font-medium text-blue-900">{cls.name}</Text>
                    <Text className="text-blue-700 text-sm">{cls.instructor}</Text>
                    <Text className="text-blue-600 text-sm">
                      {cls.day} • {cls.startTime} - {cls.endTime}
                    </Text>
                    <Text className="text-blue-600 text-sm">{cls.location}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteClass(cls.id)}>
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredAssignments.map((assignment) => (
          <TouchableOpacity
            key={assignment.id}
            className="mb-4"
            onPress={() => router.push('/tasks/assignments')}
          >
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(assignment.priority)}`} />
                  <View className="flex-1">
                    <Text className={`font-medium ${assignment.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                      {assignment.title}
                    </Text>
                    {assignment.description && (
                      <Text className="text-gray-500 text-sm">{assignment.description}</Text>
                    )}
                    <Text className="text-gray-500 text-sm">Course: {assignment.course}</Text>
                    <Text className="text-gray-500 text-sm">Status: {assignment.status}</Text>
                    <Text className="text-gray-500 text-sm">Due: {formatDate(assignment.deadline)}</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => toggleAssignmentStatus(assignment.id, assignment.status)}
                    className="mr-2"
                  >
                    <Ionicons
                      name={assignment.status === 'Completed' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={24}
                      color={assignment.status === 'Completed' ? '#10B981' : '#6B7280'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteAssignment(assignment.id)}>
                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View className="flex-auto bg-gray-100">
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold">My Tasks</Text>
        <View className="flex-row">
          {/* <TouchableOpacity
            onPress={() => router.push('/tasks/class-schedule')}
            className="bg-blue-500 px-4 py-2 rounded-lg mr-2"
          >
            <Text className="text-white font-semibold">Add Class</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/tasks/assignments')}
            className="bg-green-500 px-4 py-2 rounded-lg mr-2"
          >
            <Text className="text-white font-semibold">Add Assignment</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => router.push('/tasks/new')}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">New Task</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="my-4 flex-none bg-transparent" 
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <FilterButton type="all" label="All" />
        <FilterButton type="today" label="Today" />
        <FilterButton type="upcoming" label="Upcoming" />
        <FilterButton type="completed" label="Completed" />
        <FilterButton type="uncompleted" label="Uncompleted" />
        <FilterButton type="classes" label="Classes" />
        <FilterButton type="assignments" label="Assignments" />
      </ScrollView>

      {renderContent()}
    </View>
  );
} 