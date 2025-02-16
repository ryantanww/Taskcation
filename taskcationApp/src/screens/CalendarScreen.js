// Import dependencies and libraries used in Calendar Screen
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { addMonths, addDays  } from 'date-fns';
import Header from '../components/Header';
import MonthlyView from '../components/MonthlyView';
import WeeklyView from '../components/WeeklyView';
import DailyView from '../components/DailyView';
import { getTasksByCreator  } from '../services/taskService';
import { markAllSubtasksComplete } from '../services/subtaskService';
import { updateTask } from '../services/taskService';
import { db } from '../../firebaseConfig';

const CalendarScreen = () => {
    // Access the navigation object
    const navigation = useNavigation();

    // Hook for rerendering the screen
    const isFocused = useIsFocused();

    // State to store user ID
    const [userID, setUserID] = useState(null);
    
    // State to store the current active tab
    const [activeTab, setActiveTab] = useState('Monthly');

    // State to store the current selected date default to today
    const [selectedDate, setSelectedDate] = useState(new Date());

    // State to store the tasks
    const [tasks, setTasks] = useState([]);

    // State for loading status
    const [loading, setLoading] = useState(true);

    // useEffect to fetch tasks on component mount
    useEffect(() => {
        fetchTasks();
    }, [activeTab, selectedDate]);

    // useEffect to fetch tasks when screen is focused
    useEffect(() => {
        // Call the fetchTasks function whenever isFocused changes
        if (isFocused) {
            fetchTasks();
        }
    }, [isFocused, activeTab, selectedDate]);


    // Function to fetch tasks for the user
    const fetchTasks = async () => {
        try {
            // Retrieve the user ID from AsyncStorage
            const storedUserID = await AsyncStorage.getItem('user_id');
            // Set user ID in state
            setUserID(storedUserID);

            // Fetch the tasks from the Firebase database
            const fetchedTasks = await getTasksByCreator(db, storedUserID);

            // Convert the end date to a JS date
            fetchedTasks.forEach(task => {
                task.end_date = convertToDate(task.end_date);
            });

            // Store the users tasks into the tasks state
            setTasks(fetchedTasks);
        } catch (error) {
            // Log any errors when fetching tasks
            console.error('Error fetching tasks:', error);
            // Alert error when failed to fetch task
            Alert.alert('Fetching Tasks Error', 'Failed to fetch tasks.');
        } finally {
            // Set loading state to false
            setLoading(false);
        }
    };

    // Convert a Firestore Timestamp to a JS Date
    function convertToDate(possibleTimestamp) {
        if (!possibleTimestamp) return null;

        // Check if it's a Firestore Timestamp
        if (typeof possibleTimestamp.toDate === 'function') {
            return possibleTimestamp.toDate();
        }

        // If it's not a Firestore Timestamp, check if it's a valid date string or number
        const dateObj = new Date(possibleTimestamp);
        if (!isNaN(dateObj.getTime())) {
            // Return as a JS Date if it's valid
            return dateObj; 
        }

        // Return null for invalid dates
        return null; 
    }

    // Function to toggle the checkbox for a specific task
    const toggleTaskCompletion = async (taskID) => {
        try {
            // Find the task to update by taskID
            const taskToUpdate = tasks.find((task) => task.id === taskID);
            // Exit the array if taskID is not found
            if (!taskToUpdate) return;
    
            // Toggle the task status
            const updatedStatus = !taskToUpdate.status;
            // Update the task status in the Firebase database
            await updateTask(db, taskID, { status: updatedStatus });

            // If marking the task as completed, mark all subtasks as well
            if (updatedStatus) {
                await markAllSubtasksComplete(db, taskID, true);
            }
    
            // Refresh the tasks so that it is updated and reflected on the screen
            fetchTasks();
        } catch (error) {
            // Log any errors when updating task status
            console.error('Error updating task:', error);
            // Alert error when failed to update task status
            Alert.alert('Update Task Error', 'Failed to update task.');
        }
    };
    
    // Function to handle navigation to TaskDetailScreen
    const handleNavigation = (taskID) => {
        navigation.navigate('TaskDetailScreen', { taskID });
    };

    // Function to handle changing to previous month
    const handlePrevMonth = () => {
        setSelectedDate((prev) => addMonths(prev, -1));
    };

    // Function to handle changing to next month
    const handleNextMonth = () => {
        setSelectedDate((prev) => addMonths(prev, 1));
    };

    // Function to handle changing to previous week
    const handlePrevWeek = () => {
        setSelectedDate((prev) => addDays(prev, -7));
    };

    // Function to handle changing to next week
    const handleNextWeek = () => {
        setSelectedDate((prev) => addDays(prev, 7));
    };

    // Function to handle changing to previous day
    const handlePrevDay = () => {
        setSelectedDate((prev) => addDays(prev, -1));
    };

    // Function to handle changing to next day
    const handleNextDay = () => {
        setSelectedDate((prev) => addDays(prev, 1));
    };

    // Display loading indicator if tasks are still loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading tasks...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Render the header component */}
            <Header />
            {/* Render the Monthly, Weekly and Daily Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'Monthly' && styles.activeTab]} onPress={() => setActiveTab('Monthly')}>
                    <Text style={[styles.tabText, activeTab === 'Monthly' && styles.activeTabText]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'Weekly' && styles.activeTab]} onPress={() => setActiveTab('Weekly')}>
                    <Text style={[styles.tabText, activeTab === 'Weekly' && styles.activeTabText]}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'Daily' && styles.activeTab]} onPress={() => setActiveTab('Daily')}>
                    <Text style={[styles.tabText, activeTab === 'Daily' && styles.activeTabText]}>Daily</Text>
                </TouchableOpacity>
            </View>
        
            {/* Render the correct view depending on the active tab*/}
            {activeTab === 'Monthly' && (
                <MonthlyView
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    tasks={tasks}
                    onTaskPress={handleNavigation}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    toggleTaskCompletion={toggleTaskCompletion}
                />
            )}
            {activeTab === 'Weekly' && (
                <WeeklyView
                    selectedDate={selectedDate}
                    tasks={tasks}
                    onTaskPress={handleNavigation}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                />
            )}
            {activeTab === 'Daily' && (
                <DailyView
                    selectedDate={selectedDate}
                    tasks={tasks}
                    onTaskPress={handleNavigation}
                    onPrevDay={handlePrevDay}
                    onNextDay={handleNextDay}
                />
            )}
        </SafeAreaView>
    );
};
    
const styles = StyleSheet.create({
    // Style for the container
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    // Style for the tabContainer
    tabContainer: {
        flexDirection: 'row',
    },
    // Style for the tab
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5DC', 
        borderWidth: 2,
        borderRadius: 8,
        borderColor: '#8B4513',
    },
    // Style for the activeTab
    activeTab: {
        backgroundColor: '#8B4513',
    },
    // Style for the tabText
    tabText: {
        color: '#8B4513',
        fontSize: 24,
        fontWeight: '800',
    },
    // Style for the activeTabText
    activeTabText: {
        color: '#F5F5DC',
    },
});

export default CalendarScreen;