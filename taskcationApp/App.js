// Import dependencies and libraries used for App
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTab from './src/components/BottomTab';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import EditTaskScreen from './src/screens/EditTaskScreen';


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
            <Stack.Screen name='TaskDetail' component={TaskDetailScreen}  options={{ headerShown: false }}/>

            {/* Edit Task Screen */}
            <Stack.Screen name='EditTaskScreen' component={EditTaskScreen}  options={{ headerShown: false }}/>
        </Stack.Navigator>
    </NavigationContainer>
  );
}