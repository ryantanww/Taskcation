// Import dependencies and libraries used in Group Detail Screen
import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect  } from '@react-navigation/native';
import Subheader from '../components/Subheader';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getTasksByGroup, updateTask } from '../services/taskService';
import { getGroupByID } from '../services/groupsService';
import { getGradeByID } from '../services/gradesService';
import { markAllSubtasksComplete } from '../services/subtaskService';
import { db } from '../../firebaseConfig';

const GroupDetailScreen = () => {
    // Access the route  object to get the taskID passed from navigation
    const route = useRoute();
    const { groupID } = route.params;

    // Access the navigation object
    const navigation = useNavigation();

    // State to store tasks
    const [tasks, setTasks] = useState([]);

    // State for storing group details
    const [group, setGroup] = useState(null);
    
    // State for storing grade details
    const [grade, setGrade] = useState(null);

    // State for loading status
    const [loading, setLoading] = useState(true);
    
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

    useEffect(() => {
        
        fetchData();
    }, [groupID]);

    const fetchData = async () => {
        try{
            setLoading(true);
            // Fetch the group details from the Firebase database based on groupID
            if (groupID) {
                const fetchedGroup = await getGroupByID(db, groupID);
                if (fetchedGroup) {
                    // Store the group detail into the group state
                    setGroup({ id: groupID, ...fetchedGroup });
                    // If group has a grade, fetch it
                    if (fetchedGroup.grade_id) {
                        const fetchedGrade = await getGradeByID(db, fetchedGroup.grade_id);
                        if (fetchedGrade) {
                            // Store the grade detail into the grade state
                            setGrade({ id: fetchedGroup.grade_id, ...fetchedGrade });
                        }
                    }
                }
            }
            
            const fetchedTasks = await getTasksByGroup(db, groupID);
            if (!fetchedTasks) {
                setTasks([]);
            } else {
                fetchedTasks.forEach((task) => {
                    task.end_date = convertToDate(task.end_date);
                });
                // Sort tasks by ascending end_date
                fetchedTasks.sort(
                    (a, b) => new Date(a.end_date) - new Date(b.end_date)
                );
                setTasks(fetchedTasks);
            }
        } catch (error){
            console.error('Error fetching group or grade or tasks:', error);
            Alert.alert('Error fetching group or grade or tasks', 'Failed to fetch group or grade or tasks.');
        } finally {
            setLoading(false);
        }
    }

    // Render each task of the users
    const renderTask = ({ task }) => {
        
        return (
            // Allows users to navigate to TaskDetail screen when clicked
            <TouchableOpacity
                onPress={() => navigation.navigate('TaskDetail', { taskID: task.id })}
            >
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
                        <Ionicons
                            name={task.status ? 'checkbox' : 'square-outline'}
                            size={28}
                            color={task.status ? '#FFFFFF' : '#8B4513'}
                        />
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
            fetchData();
        } catch (error) {
            // Log any errors when updating task status
            console.error('Error updating task status:', error);
            Alert.alert('Error updating task status', 'Failed to update tasks status.');
        }
    };
    
    // useFocusEffect to refresh task detail whenever the screen is focused
        useFocusEffect(
            // useCallback ensures that the function does not get recreated unnecessarily
            useCallback(() => {
                fetchData();
            }, [groupID])
        );
    
    // Display loading indicator if tasks are still loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading group and tasks...</Text>
            </View>
        );
    }

    if (!group) return null;
    
    return (
        <SafeAreaView style={styles.container}>
            {/* Render the header component */}
            <Subheader title={group.group_name} hasKebab={true} itemID={group.id} itemType={'Group'} />

            { group.group_type === 'Subjects' && grade && (
                <>
                    {/* Render the upcoming container */}
                    <View style={styles.gradesContainer}>
                        <Text style={styles.gradesTitle}>Grades</Text>
                        <Text style={styles.gradesTitle}>{grade.grade}</Text>
                    </View>
                </>
            )}
            
            {/* Scrollable content container to allow vertical scrolling */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Rendering for tasks or empty state */}
                {tasks.length === 0 ? (
                    <View style={styles.noTasksContainer}>
                        <Text style={styles.noTasksText}>
                            {'No Tasks added for ' + group.group_name  + '!' }
                        </Text>
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
    // Style for the gradesContainer
    gradesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 6,
        marginHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the gradesTitle
    gradesTitle: {
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
        color: '#FFFFFF',
        flex: 1,
        fontWeight: '500',
        overflow: 'hidden',
    },
    noTasksContainer: {
        marginTop: 32,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },

    noTasksText: {
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the strikeThrough
    strikeThrough: {
        position: 'absolute',
        height: 2,
        backgroundColor: '#FFFFFF',
        width: '90%',
        left: 5,
        top: '90%',
        zIndex: 0,
    },
});


export default GroupDetailScreen;