// Import dependencies and libraries used for App
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTab from './src/components/BottomTab';


// Create a stack navigator instance
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
        {/* Define the stack navigator */}
        <Stack.Navigator initialRouteName="BottomTab">
            
            {/* BottomTab screen (home) */}
            <Stack.Screen name="BottomTab" component={BottomTab} options={{ headerShown: false }} />
        </Stack.Navigator>
    </NavigationContainer>
  );
}