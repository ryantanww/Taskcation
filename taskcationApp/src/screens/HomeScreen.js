
// Import dependencies and libraries used in Home Screen
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { db } from '../../firebaseConfig';

import { createUser } from '../services/userService';

import { getTasksByCreator } from '../services/taskService';

const HomeScreen = () => {
    // State to store user ID
    const [userID, setUserID] = useState(null);

    // State to store tasks
    const [tasks, setTasks] = useState([]);

    // State to store joined date of user
    const [joinedDate, setJoinedDate] = useState('');

    // State for tracking checkbox of no tasks added  
    const [isChecked, setIsChecked] = useState(false);

    // State for loading status
    const [loading, setLoading] = useState(true);

    // State for error messages if fetching data fails
    const [error, setError] = useState(null);

    // Function to format the dates into dd/mm/yyyy format
    const formatDate = (dateString) => {
        const formattedDate = new Date(dateString).toLocaleDateString('en-GB', 
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formattedDate;
    }

    // useEffect to initialise user and fetch tasks on component mount
    useEffect(() => {
        async function initialiseAndFetch() {
            try {
                // Set loading state to true while waiting to initialise user and fetch tasks
                setLoading(true);

                // Initialise user
                await initialiseUser();

                // If userID exists, fetch the tasks linked to the user
                if (userID) {
                    await fetchTasks(userID);
                }
            } catch (error) {
                // Set error if initialising user and fetching tasks fails
                setError('Failed to initialise user and fetch tasks!');
            } finally {
                // Set loading to false once the user and tasks is fetched
                setLoading(false);
            }
        }
    
        initialiseAndFetch();
    }, [userID]);

    // Function to initialise user by checking the AsyncStorage or creating a new user
    async function initialiseUser() {
        try {
            // Retrieve the user ID and joined date from AsyncStorage
            let storedUserId = await AsyncStorage.getItem('user_id');
            let storedJoinedDate = await AsyncStorage.getItem('joined_date');

            // Get the current date
            const today = new Date();
    
            // If there is no user ID, create a temporary user
            if (!storedUserId) {
                // Generate a random temporary username
                const tempName = `temp_user_${Math.floor(Math.random() * 10000)}`;
                
                // Use the temporary username to create a temporary user in the Firebase database
                const newUserId = await createUser(db, { username: tempName, is_temporary: true });

                // Store the new user ID
                storedUserId = newUserId;
                // Set the joined date to today
                storedJoinedDate = today.toISOString();
    
                // Save the user ID and joined date into AsyncStorage
                await AsyncStorage.setItem('user_id', storedUserId);
                await AsyncStorage.setItem('joined_date', storedJoinedDate);
            }
    
            // Update the user ID and joined date state
            setUserID(storedUserId);
            setJoinedDate(formatDate(storedJoinedDate));
        } catch (err) {
            // Log any errors when initialising the user
            console.error('Error initialising user:', err);
            // Set error if initialising user
            setError('Failed to initialise user!');
        }
    }

    // Function to fetch tasks for the user
    async function fetchTasks(userID) {
        try {
            // Fetch the tasks from the Firebase database
            const fetchedTasks = await getTasksByCreator(db, userID);
    
            // If there are no tasks found return an empty array else retrieve and store the user tasks
            if (!fetchedTasks) {
                // Set the tasks state to an empty array
                setTasks([]);
            } else {
                // Store the users tasks into the tasks state
                setTasks(fetchedTasks);
            }
        } catch (err) {
            // Log any errors when fetching tasks
            console.error('Error fetching tasks:', err);
            // Set error if fetching tasks fails
            setError('Failed to fetch tasks!');
        }
    }
    
    // Render each task of the users
    const renderTask = ({ task }) => {
        
        return (
            // Task container for each task, changed when completed
            <View
                style={[
                    styles.tasksContainer,
                    task.status && styles.tasksCompletedContainer,
                ]}
            >
                {/* Strike through line only when task is completed */}
                {task.status && <View style={styles.strikeThrough} testID={`strikeThrough-${task.id}`}/>}
                {/* Task name */}
                <Text
                    style={[
                        styles.taskText,
                        task.status && styles.tasksCompletedText,
                    ]}
                >
                    {task.task_name}
                </Text>
                {/* Clickable Checkbox for toggling task completion */}
                <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)} testID={`checkbox-${task.id}`} >
                    <Ionicons
                        name={task.status ? 'checkbox' : 'square-outline'}
                        size={28}
                        color={task.status ? '#FFFFFF' : '#8B4513'}
                    />
                </TouchableOpacity>
            </View>
        );
    };
    
    // Group tasks by their end date
    const groupedTasks = tasks.reduce((groups, task) => {
        // Format the end date
        const taskDate = formatDate(task.end_date);

        // Create a new date group if it does not exist
        if (!groups[taskDate]) {
            groups[taskDate] = [];
        }
        
        // Add task to the group
        groups[taskDate].push(task);
        return groups;
    }, {});
    
    // Toggle the initial task for new users
    const handleCheckboxToggle = () => {
        setIsChecked((prev) => !prev);
    };

    // Function to toggle the checkbox for a specific task
    const toggleTaskCompletion = async (taskID) => {
        try {
            // Find the task to update by task ID
            const taskToUpdate = tasks.find((task) => task.id === taskID);
            // Exit the array if task ID is not found
            if (!taskToUpdate) return;
    
            // Toggle the task status
            const updatedStatus = !taskToUpdate.status;
            // Update the task status in the Firebase database
            await updateTask(db, taskID, { status: updatedStatus });
    
            // Refresh the tasks so that it is updated and reflected on the screen
            const refreshedTasks = await getTasksByCreator(db, userID);
            setTasks(refreshedTasks || []);
        } catch (error) {
            // Log any errors when updating task status
            console.error('Error updating task status:', error);
            // Set error if updating task status fails
            setError('Failed to update task status!');
        }
    };
    
    // Display loading indicator if tasks are still loading
    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading tasks...</Text>
            </View>
        );
    }

    // Display error message if initialising user and fetching fails
    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Render the header component */}
            <View style={styles.header}>
                <Text style={styles.appTitle}>Taskcation</Text>
            </View>

            {/* Render the upcoming container */}
            <View style={styles.upcomingContainer}>
                <Text style={styles.upcomingTitle}>Upcoming</Text>
            </View>

            {/* Rendering for tasks or empty state */}
            {tasks.length === 0 ? (
                <View> 
                    {/* Render the date container with relevant information like date and a line */}
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{joinedDate}</Text>
                        <View style={styles.line} />
                    </View>
                    {/* Render the task container, changed when completed */}
                    <View style={[
                            styles.tasksContainer,
                            isChecked && styles.tasksCompletedContainer,
                    ]}>
                        {/* Strike through line only when task is completed */}
                        {isChecked && <View style={styles.strikeThrough} testID='strikeThrough-no-tasks' />}

                        {/* Task name */}
                        <Text style={[
                                styles.tasksText,
                                isChecked && styles.tasksCompletedText,
                            ]}
                        >
                            Add task to start using Taskcation!
                        </Text>

                        {/* Clickable Checkbox for toggling task completion */}
                        <TouchableOpacity onPress={handleCheckboxToggle} testID='checkbox-no-tasks' >
                            <Ionicons
                                name={isChecked ? 'checkbox' : 'square-outline'}
                                size={24}
                                color={isChecked ? '#FFFFFF' : '#8B4513'}
                            />
                        </TouchableOpacity>
                        
                    </View>
                </View>
            ) : (
                // Iterates over each date in groupedTasks and renders a date header and list of tasks for that date
                Object.keys(groupedTasks).map((date) => (
                    // Render the date container with relevant information like date and a line
                    <View key={date} style={styles.dateContainer}>
                        <Text style={styles.dateText}>{date}</Text>
                        <View style={styles.line} />
                        {/* Render the tasks for that date and display it using the renderTask function */}
                        {groupedTasks[date].map((gTask) => (
                            <React.Fragment key={gTask.id}>
                                {renderTask({ task: gTask })}
                            </React.Fragment>
                        ))}
                    </View>
                ))
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Style for the container
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    // Style for the header
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#8B4513',
        backgroundColor: '#8B4513',
    },
    // Style for the app title
    appTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    // Style for the upcoming container
    upcomingContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Style for the upcoming title
    upcomingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5A3311',
    },
    // Style for the date container
    dateContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Style for the date text
    dateText: {
        fontSize: 18,
        color: '#5A3311',
    },
    // Style for the line
    line: {
        height: 2,
        backgroundColor: '#5A3311',
        marginVertical: 8,
    },
    // Style for the task container
    tasksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8DC',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 16,
        marginTop: 16,
        borderWidth: 2,
        borderColor: '#8B4513',
        justifyContent: 'space-between',
    },
    // Style for the task completed container
    tasksCompletedContainer: {
        backgroundColor: '#8B4513',
    },
    // Style for the task text
    tasksText: {
        fontSize: 18,
        color: '#5A3311',
        flex: 1,
    },
    // Style for the task completed text
    tasksCompletedText: {
        color: '#FFFFFF',
    },
    // Style for the strike through
    strikeThrough: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#FFFFFF',
        width: '95%',
        left: 5,
        top: '90%',
        zIndex: 0,
    },
    // Style for the error text
    errorText: {
        color: 'red',
        fontSize: 18,
    },
});


export default HomeScreen;