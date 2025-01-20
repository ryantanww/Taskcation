// Import dependencies and libraries used for Bottom Tab
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import GroupsScreen from '../screens/GroupsScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TimerScreen from '../screens/TimerScreen';


// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

const BottomTab = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // Set the icon for each tab based on the route
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    // If statement to determine the route and Ionicons to be used
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Groups') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Add Task') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Calendar') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Timer') {
                        // Use MaterialIcons for Timer
                        return (
                            <View style={styles.tabBarIconContainer}>
                                <MaterialIcons
                                    name={focused ? 'timer' : 'timer-off'}
                                    size={size}
                                    color={color}
                                />
                            </View>
                        );
                    }
                    return (
                        // Based on the specific route, a corresponding Ionicons will be displayed
                        <View style={styles.tabBarIconContainer}>
                            <Ionicons name={iconName} size={size} color={color} />
                        </View>
                    );
                },
                // Style for the bar based on whether it is active or not
                tabBarActiveTintColor: '#D2B48C',
                tabBarInactiveTintColor: '#f4a460',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
            })}
        >
            {/* Tab for HomeScreen */}
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            
            {/* Tab for GroupsScreen */}
            <Tab.Screen name="Groups" component={GroupsScreen} options={{ headerShown: false }} />
            
            {/* Tab for AddTaskScreen */}
            <Tab.Screen name="Add Task" component={AddTaskScreen} options={{ headerShown: false }} />

            {/* Tab for GroupsScreen */}
            <Tab.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
            
            {/* Tab for AddTaskScreen */}
            <Tab.Screen name="Timer" component={TimerScreen} options={{ headerShown: false }} />


        </Tab.Navigator>
        
        
    );
};

const styles = StyleSheet.create({
    // Style for the tab bar
    tabBar: {
        backgroundColor: '#8B4513',
        borderTopColor: '#8B4513',
        borderTopWidth: 2,
        padding: 10,
        minHeight: 60,
    },
    // Style for the tab labels
    tabBarLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        paddingBottom: 5,
        textAlign: 'center',
    },
    // Style for the tab bar icons container
    tabBarIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BottomTab;