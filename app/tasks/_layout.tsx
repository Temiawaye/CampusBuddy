import { Stack } from 'expo-router';

export default function TasksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="new"
        options={{
          title: 'New Task',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="class-schedule"
        options={{
          title: 'Class Schedule',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="assignments"
        options={{
          title: 'Assignments',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 