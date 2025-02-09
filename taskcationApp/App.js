// Import dependencies and libraries used for App
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTab from './src/components/BottomTab';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import EditTaskScreen from './src/screens/EditTaskScreen';
import AddSubtaskScreen from './src/screens/AddSubtaskScreen';
import SubtaskDetailScreen from './src/screens/SubtaskDetailScreen';
import EditSubtaskScreen from './src/screens/EditSubtaskScreen';
import AddGroupScreen from './src/screens/AddGroupScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import EditGroupScreen from './src/screens/EditGroupScreen';


// Create a stack navigator instance
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
        {/* Define the stack navigator */}
        <Stack.Navigator initialRouteName='BottomTab'>
            
            {/* BottomTab screen (home) */}
            <Stack.Screen name='BottomTab' component={BottomTab} options={{ headerShown: false }} />

            {/* Task Detail Screen */}
            <Stack.Screen name='TaskDetailScreen' component={TaskDetailScreen}  options={{ headerShown: false }}/>

            {/* Edit Task Screen */}
            <Stack.Screen name='EditTaskScreen' component={EditTaskScreen}  options={{ headerShown: false }}/>

            {/* Add Subtask Screen */}
            <Stack.Screen name='AddSubtaskScreen' component={AddSubtaskScreen}  options={{ headerShown: false }}/>

            {/* Subtask Detail Screen */}
            <Stack.Screen name="SubtaskDetailScreen" component={SubtaskDetailScreen} options={{ headerShown: false }}/>

            {/* Edit Subtask Screen */}
            <Stack.Screen name="EditSubtaskScreen" component={EditSubtaskScreen} options={{ headerShown: false }}/>

            {/* Add Group Screen */}
            <Stack.Screen name="AddGroupScreen" component={AddGroupScreen} options={{ headerShown: false }}/>

            {/* Group Detail Screen */}
            <Stack.Screen name="GroupDetailScreen" component={GroupDetailScreen} options={{ headerShown: false }}/>

            {/* Edit Group Screen */}
            <Stack.Screen name="EditGroupScreen" component={EditGroupScreen} options={{ headerShown: false }}/>
        </Stack.Navigator>
    </NavigationContainer>
  );
}