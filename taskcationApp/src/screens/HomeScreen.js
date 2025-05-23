// Import dependencies and libraries used in Home Screen
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { createUser } from '../services/userService';
import { getTasksByCreator, updateTask } from '../services/taskService';
import { createGroup, getGroupsByCreator } from '../services/groupsService';
import { markAllSubtasksComplete } from '../services/subtaskService';
import { db } from '../../firebaseConfig';

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

    // Hook for rerendering the screen
    const isFocused = useIsFocused();

    // Hook for navigating to other screens
    const navigation = useNavigation();

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

    // Function to format the dates into dd/mm/yyyy format
    const formatDate = (date) => {
        const dateObj = convertToDate(date);
        if (!dateObj) {
            return 'Invalid Date';
        }
        const formattedDate = new Date(dateObj).toLocaleDateString('en-GB', 
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formattedDate;
    }

    // useEffect to initialise user and fetch tasks on component mount
    useEffect(() => {( async () => {
            try {
                // Set loading state to true
                setLoading(true);
                // Retrieve the user ID and joined date from AsyncStorage
                let storedUserId = await AsyncStorage.getItem('user_id');
                let storedJoinedDate = await AsyncStorage.getItem('joined_date');
        
                // If there is no user ID, create a temporary user
                if (!storedUserId) {
                    // Generate a random temporary username
                    const tempName = `temp_user_${Math.floor(Math.random() * 10000)}`;

                    // Use the temporary username to create a temporary user in the Firebase database
                    const newUserId = await createUser(db, { username: tempName, is_temporary: true });
                    // Store the new user ID
                    storedUserId = newUserId;

                    // Get the current date
                    const today = new Date().toISOString();
                    // Set the joined date to today
                    storedJoinedDate = today;

                    // Save the user ID and joined date into AsyncStorage
                    await AsyncStorage.setItem('user_id', storedUserId);
                    await AsyncStorage.setItem('joined_date', storedJoinedDate);
                }
        
                // Set user ID and joined date in state
                setUserID(storedUserId);
                setJoinedDate(formatDate(storedJoinedDate));
        
                // Fetch groups created by the user
                const userGroups = await getGroupsByCreator(db, storedUserId);

                // If no groups exist, create a default category and subject
                if (userGroups.length === 0) {
                    await createGroup(db, {
                        group_name: 'Math',
                        group_type: 'Subjects',
                        grade_id: 'NA',
                        created_by: storedUserId,
                    });
                    await createGroup(db, {
                        group_name: 'General',
                        group_type: 'Categories',
                        grade_id: 'NA',
                        created_by: storedUserId,
                    });
                }
        
                // Fetch the tasks from the Firebase database
                const fetchedTasks = await getTasksByCreator(db, storedUserId);
        
                // If there are no tasks found return an empty array else retrieve and store the user tasks
                if (!fetchedTasks) {
                    // Set the tasks state to an empty array
                    setTasks([]);
                } else {
                    // Convert the end date to a JS date
                    fetchedTasks.forEach(task => {
                        task.end_date = convertToDate(task.end_date);
                    });

                    // Then sort them by ascending order
                    fetchedTasks.sort((a, b) => {
                        return new Date(a.end_date) - new Date(b.end_date);
                    });

                    // Store the users tasks into the tasks state
                    setTasks(fetchedTasks);
                }
            } catch (err) {
                // Log any errors when initialising user, groups or tasks
                console.error('Initialisation error:', err);
                // Set error if initialising fails
                setError('Failed to initialise user, groups or tasks.');
            } finally {
                // Set loading state to false
                setLoading(false);
            }
            })();
    }, []);
    
    // useEffect to fetch tasks when screen is focused
    useEffect(() => {
        // Call the fetchTasks function whenever isFocused or userID changes
        if (isFocused && userID) {
            fetchTasks(userID);
        }
    }, [isFocused, userID]);

    // Function to fetch tasks for the user
    const fetchTasks = async (creatorID) => {
        try {
            // Fetch the tasks from the Firebase database
            const fetchedTasks = await getTasksByCreator(db, creatorID);
    
            // If there are no tasks found return an empty array else retrieve and store the user tasks
            if (!fetchedTasks) {
                // Set the tasks state to an empty array
                setTasks([]);
            } else {
                // Convert the end date to a JS date
                fetchedTasks.forEach(task => {
                    task.end_date = convertToDate(task.end_date);
                });

                // Then sort them by ascending order
                fetchedTasks.sort((a, b) => {
                    return new Date(a.end_date) - new Date(b.end_date);
                });

                // Store the users tasks into the tasks state
                setTasks(fetchedTasks);
            }
        } catch (error) {
            // Log any errors when fetching tasks
            console.error('Error fetching tasks:', error);
            // Set error if fetching tasks fails
            setError('Failed to fetch tasks.');
        }
    }
    
    // Render each task of the users
    const renderTask = ({ task }) => {
        
        return (
            // Allows users to navigate to TaskDetailScreen screen when clicked
            <TouchableOpacity onPress={() => navigation.navigate('TaskDetailScreen', { taskID: task.id })}>
                {/* Task container for each task, changes when completed */}
                <View style={[ styles.tasksContainer, task.status && styles.tasksCompletedContainer]}>
                    {/* Strike through line only when task is completed */}
                    {task.status && <View style={styles.strikeThrough} testID={`strikeThrough-${task.id}`}/>}

                    {/* Task name */}
                    <Text style={[ styles.tasksText, task.status && styles.tasksCompletedText]} numberOfLines={1} ellipsizeMode='tail'>
                        {task.task_name}
                    </Text>
                    
                    {/* Clickable Checkbox for toggling task completion */}
                    <TouchableOpacity onPress={() => toggleTaskCompletion(task.id)} testID={`checkbox-${task.id}`} >
                        <Ionicons name={task.status ? 'checkbox' : 'square-outline'} size={28} color={task.status ? '#F5F5DC' : '#8B4513'}/>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
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
            fetchTasks(userID);
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
            <View style={styles.loadingContainer}>
                <Text>Loading tasks...</Text>
            </View>
        );
    }

    // Display error message if initialising user and fetching fails
    if (error) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Render the header component */}
            <Header />

            {/* Render the upcoming container */}
            <View style={styles.upcomingContainer}>
                <Text style={styles.upcomingTitle}>Upcoming</Text>
            </View>
            {/* Scrollable content container to allow vertical scrolling */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Rendering for tasks or empty state */}
                {tasks.length === 0 ? (
                    <>
                        {/* Render the date container with relevant information like date and a line */}
                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>{joinedDate}</Text>
                            <View style={styles.line} />
                        
                            {/* Render the task container, changed when completed */}
                            <View style={[ styles.tasksContainer, isChecked && styles.tasksCompletedContainer]}>
                                {/* Strike through line only when task is completed */}
                                {isChecked && <View style={styles.strikeThrough} testID='strikeThrough-no-tasks' />}

                                {/* Task name */}
                                <Text style={[ styles.tasksText, isChecked && styles.tasksCompletedText]} numberOfLines={1} ellipsizeMode='tail'>
                                    Add task to start using Taskcation!
                                </Text>

                                {/* Clickable Checkbox for toggling task completion */}
                                <TouchableOpacity onPress={handleCheckboxToggle} testID='checkbox-no-tasks' >
                                    <Ionicons name={isChecked ? 'checkbox' : 'square-outline'} size={28} color={isChecked ? '#F5F5DC' : '#8B4513'}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Style for the container
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    // Style for the scrollContainer
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 16,
    },
    // Style for the loadingContainer
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5DC',
    },
    // Style for the upcomingContainer
    upcomingContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Style for the upcomingTitle
    upcomingTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#8B4513',
    },
    // Style for the dateContainer
    dateContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    // Style for the dateText
    dateText: {
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the line
    line: {
        height: 2,
        backgroundColor: '#8B4513',
        marginVertical: 8,
    },
    // Style for the tasksContainer
    tasksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC',        
    },
    // Style for the tasksCompletedContainer
    tasksCompletedContainer: {
        backgroundColor: '#8B4513',
    },
    // Style for the tasksText
    tasksText: {
        fontSize: 20,
        color: '#8B4513',
        flex: 1,
        fontWeight: '500',
        overflow: 'hidden',
    },
    // Style for the tasksCompletedText
    tasksCompletedText: {
        fontSize: 20,
        color: '#F5F5DC',
        flex: 1,
        fontWeight: '500',
        overflow: 'hidden',
    },
    // Style for the strikeThrough
    strikeThrough: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#F5F5DC',
        width: '90%',
        left: 5,
        top: '90%',
        zIndex: 0,
    },
    // Style for the errorText
    errorText: {
        color: 'red',
        fontSize: 20,
        fontWeight: '500',
    },
});


export default HomeScreen;