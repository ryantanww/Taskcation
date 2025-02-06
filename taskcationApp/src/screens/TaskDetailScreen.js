// Import dependencies and libraries used in Task Detail Screen
import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    StyleSheet,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect  } from '@react-navigation/native';
import Subheader from '../components/Subheader';
import Ionicons from '@expo/vector-icons/Ionicons';
import ViewAttachments from '../components/ViewAttachments';
import { getTaskByID, updateTask } from '../services/taskService';
import { getSubtasksByTaskID, updateSubtask, markAllSubtasksComplete } from '../services/subtaskService';
import { getGroupByID } from '../services/groupsService';
import { getGradeByID } from '../services/gradesService';
import { getPriorityByID } from '../services/priorityLevelsService';
import { getAttachmentsByTaskID } from '../services/attachmentService';
import { db } from '../../firebaseConfig';

const TaskDetailScreen = () => {
    // Access the route  object to get the taskID passed from navigation
    const route = useRoute();
    const { taskID } = route.params;

    // Access the navigation object
    const navigation = useNavigation();

    // State to control the timer modal
    const [timerModalVisible, setTimerModalVisible] = useState(false);
    
    // State for storing task details
    const [task, setTask] = useState(null);
    
    // State for storing subtask details
    const [subtasks, setSubtasks] = useState([]);
    
    // State for storing group details
    const [group, setGroup] = useState(null);
    
    // State for storing grade details
    const [grade, setGrade] = useState(null);
    
    // State for storing priority details
    const [priority, setPriority] = useState(null);
    
    // State for storing attachments
    const [attachments, setAttachments] = useState([]);
    
    // State for loading status
    const [loading, setLoading] = useState(true);

    // useEffect to fetch task on component mount
    useEffect(() => {    
        fetchTask();
    }, [taskID]);
    
    // useEffect to fetch other related data using task details such as group, grades, priority, attachments, time and subtasks
    useEffect(() => {
        // Check if there is task
        if (!task) return; 

        fetchGroup();
        fetchPriority();
        fetchAttachments();
        fetchSubtasks();
    }, [task]); 

    useEffect(() => {
        // Check if there is group
        if (!group) return;

        fetchGrade();
    }, [group]);

    // Function to fetch task details from database
    const fetchTask = async () => {
        try {
            // Fetch the task details from the Firebase database based on taskID
            const fetchedTask = await getTaskByID(db, taskID);
            // Check if there is a task
            if (fetchedTask) {
                // Store the task detail into the task state
                setTask({ id: taskID, ...fetchedTask });
            } 
        } catch (error) {
            // Log error in fetching task detail
            console.error('Error fetching task:', error);
            // Alert error when failed to fetch task
            Alert.alert('Fetching Task Error', 'Failed to fetch task.');
        } finally {
            // Set loading state to false
            setLoading(false);
        }
    };

    // Function to fetch group details from database
    const fetchGroup = async () => {
        try {
            // Fetch the group details from the Firebase database based on groupID in task
            if (task.group_id) {
                const fetchedGroup = await getGroupByID(db, task.group_id);
                if (fetchedGroup) {
                    // Store the group detail into the group state
                    setGroup({ id: task.group_id, ...fetchedGroup });
                }
            }
        } catch (error) {
            // Log error in fetching group detail
            console.error('Error fetching group:', error);
            // Alert error when failed to fetch group
            Alert.alert('Fetching Group Error', 'Failed to fetch group.');
        }
    };

    // Function to fetch priority details from database
    const fetchPriority = async () => {
        try {
            // Fetch the priority details from the Firebase database based on priorityID in task
            if (task.priority_id) {
                const fetchedPriority = await getPriorityByID(db, task.priority_id);
                if (fetchedPriority) {
                    // Store the priority detail into the priority state
                    setPriority({ id: task.priority_id, ...fetchedPriority });
                }
            }
        } catch (error) {
            // Log error in fetching priority detail
            console.error('Error fetching priority:', error);
            // Alert error when failed to fetch priority
            Alert.alert('Fetching Priority Error', 'Failed to fetch priority.');
        }
    };

    // Function to fetch attachments from database
    const fetchAttachments = async () => {
        try {
            // Fetch the attachments from the Firebase database based on taskID
            const fetchedAttachments = await getAttachmentsByTaskID(db, taskID);
            // Store the attachments into the attachments state
            setAttachments(fetchedAttachments || []);
        } catch (error) {
            // Log error in fetching attachments
            console.error('Error fetching attachments:', error);
            // Alert error when failed to fetch attachments
            Alert.alert('Fetching Attachments Error', 'Failed to fetch attachments.');
        }
    };

    // Function to fetch subtasks details from database
    const fetchSubtasks = async () => {
        try {
            // Fetch the subtasks details from the Firebase database based on taskID
            const fetchedSubtasks = await getSubtasksByTaskID(db, taskID);

            // Convert the end date to a JS date
            fetchedSubtasks.forEach(subtask => {
                subtask.end_date = convertToDate(subtask.end_date);
            });

            // Then sort them by ascending order
            fetchedSubtasks.sort((a, b) => {
                return new Date(a.end_date) - new Date(b.end_date);
            });

            // Store the subtasks detail into the subtasks state
            setSubtasks(fetchedSubtasks || []);
        } catch (error) {
            // Log error in fetching subtasks detail
            console.error('Error fetching subtasks:', error);
            // Alert error when failed to fetch subtasks
            Alert.alert('Fetching Subtasks Error', 'Failed to fetch subtasks.');
        }
    };

    // Function to fetch grade details from database
    const fetchGrade = async () => {
        try {
            // Fetch the grade details from the Firebase database based on gradeID in group
            if (group.grade_id) {
                const fetchedGrade = await getGradeByID(db, group.grade_id);
                if (fetchedGrade) {
                    // Store the grade detail into the grade state
                    setGrade({ id: group.grade_id, ...fetchedGrade });
                }
            }
        } catch (error) {
            // Log error in fetching grade detail
            console.error('Error fetching grade:', error);
            // Alert error when failed to fetch grade
            Alert.alert('Fetching Grade Error', 'Failed to fetch grade.');
        }
    };

    const renderSubtasks = () => {
        return subtasks.map((subtask) => {
            return (
            // Allows users to navigate to SubtaskDetail screen when clicked
            <TouchableOpacity
                disabled={task.status}
                key={subtask.id}
                onPress={() => navigation.navigate('SubtaskDetailScreen', {subtaskID: subtask.id,})}
            >
                {/* Subtask container for each subtask, changes when completed */}
                <View style={[styles.subtasksContainer, subtask.status && styles.subtasksCompletedContainer]}>
                    {/* Subtask row to align the name, date and checkbox correctly */}
                    <View style={styles.subtasksRow}>
                        {/* Subtask name */}
                        <Text style={[ styles.subtasksText, subtask.status && styles.subtasksCompletedText ]}>
                            {subtask.subtask_name}
                        </Text>
                        {/* Subtask date */}
                        <Text style={[ styles.subtasksDateText, subtask.status && styles.subtasksDateCompletedText ]}>
                            {formatDate(subtask.end_date)}
                        </Text>
                        {/* Clickable Checkbox for toggling subtask completion */}
                        <TouchableOpacity onPress={() => toggleSubtaskCompletion(subtask.id)} testID={`checkbox-${subtask.id}`}> 
                            <Ionicons
                                name={subtask.status ? 'checkmark-circle' : 'radio-button-off'}
                                size={28}
                                color={subtask.status ? '#FFFFFF' : '#8B4513'}
                            />
                        </TouchableOpacity>
                        {/* Strike through line only when subtask is completed */}
                        {subtask.status && <View style={styles.strikeSubtasks} />}
                    </View>
                </View>
            </TouchableOpacity>
            );
        });
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

    // Function to format the time into HH::MM
    const formatTime = (time) => {
        const timeObj = convertToDate(time);
        if (!timeObj) {
            return 'Invalid Date';
        }
        const formattedTime = new Date(timeObj).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return formattedTime;
    };

    // Function to format duration into a readable format
    const formatDuration = (millis) => {
        // Checks if the input is a valid number and not negative
        if (millis < 0 || typeof millis !== 'number') {
            // Alert error if the input is invalid
            Alert.alert('Formatting Duration Error', 'Failed to format duration.');
            return;
        }
    
        // Calculate and convert the duration based on the millis into days, hours, minutes and seconds
        const seconds = Math.floor(millis / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
    
        // Calculate the remaining hours after extracting full days
        const remainingHours = hours % 24;
        // Calculate the remaining minutes after extracting full hours
        const remainingMinutes = minutes % 60;
    
        // Initialise an empty array to store the formatted duration parts
        let result = [];
    
        // Append days to the result array if there are any
        if (days > 0) result.push(`${days} day${days !== 1 ? 's' : ''}`);

        // Append remaining hours to the result array if there are any
        if (remainingHours > 0) result.push(`${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`);

        // Append remaining minutes to the result array if there are any
        if (remainingMinutes > 0) result.push(`${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`);
    
        // If the result array has any values, join them into a single string
        // Otherwise return Less than a minute
        return result.length > 0 ? result.join(' ') : 'Less than a minute';
    };

    // Function to mark task as completed/uncompleted
    const toggleTaskCompletion = async () => {
        try {
            // Change the status
            const newStatus = !task.status;
            // Update the status in the database
            await updateTask(db, taskID, { status: newStatus });
            // Change the status in the task state
            setTask((prev) => ({ ...prev, status: newStatus }));

            // If marking the task as completed, mark all subtasks as well
            if (newStatus) {
                await markAllSubtasksComplete(db, taskID, true);
            }

            fetchSubtasks(taskID);
            // Alert confirmation of marking task as completed or uncompleted
            Alert.alert('Success', newStatus ? 'Task and all subtasks marked as completed.' : 'Task marked as uncompleted.');
        } catch (error) {
            // Log any errors when updating task status
            console.error('Error updating task:', error);
            // Alert error when failed to update task status
            Alert.alert('Update Task Error', 'Failed to update task.');
        }
    };

    // Function to mark subtask as completed/uncompleted
    const toggleSubtaskCompletion = async (subtaskID) => {
        try {
            // Find the subtask to update by taskID
            const subtaskToUpdate = subtasks.find((subtask) => subtask.id === subtaskID);
            // Exit the array if subtaskID is not found
            if (!subtaskToUpdate) return;
    
            // Toggle the subtask status
            const updatedStatus = !subtaskToUpdate.status;
            // Update the subtask status in the Firebase database
            await updateSubtask(db, subtaskID, { status: updatedStatus });
    
            // Refresh the subtask so that it is updated and reflected on the screen
            fetchSubtasks();
        } catch (error) {
            // Log any errors when updating subtask status
            console.error('Error updating subtask:', error);
            // Alert error when failed to update subtask status
            Alert.alert('Update Subtask Error', 'Failed to update subtask.');
        }
    };

    // useFocusEffect to refresh task detail whenever the screen is focused
    useFocusEffect(
        // useCallback ensures that the function does not get recreated unnecessarily
        useCallback(() => {
            // Function to refresh task details
            const refreshTask = async () => {
                try {
                    // Fetch the task details from the Firebase database based on taskID
                    const fetchedTask = await getTaskByID(db, taskID);
                    // Check if there is a task
                    if (fetchedTask) {
                        // Store the task detail into the task state
                        setTask({ id: taskID, ...fetchedTask });

                        // Fetch the group details from the Firebase database based on groupID in fetchedTask
                        if (fetchedTask.group_id) {
                            const fetchedGroup = await getGroupByID(db, fetchedTask.group_id);
                            if (fetchedGroup) {
                                // Store the group detail into the group state
                                setGroup({ id: fetchedTask.group_id, ...fetchedGroup });
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

                        // Fetch the priority details from the Firebase database based on priorityID in fetchedTask
                        if (fetchedTask.priority_id) {
                            const fetchedPriority = await getPriorityByID(db, fetchedTask.priority_id);
                            if (fetchedPriority) {
                                // Store the priority detail into the priority state
                                setPriority({ id: fetchedTask.priority_id, ...fetchedPriority });
                            }
                        }

                        // Fetch the attachments from the Firebase database based on taskID
                        const fetchedAttachments = await getAttachmentsByTaskID(db, taskID);
                        // Store the attachments into the attachments state
                        setAttachments(fetchedAttachments || []);

                        // Fetch the subtasks details from the Firebase database based on taskID
                        const fetchedSubtasks = await getSubtasksByTaskID(db, taskID);

                        // Convert the end date to a JS date
                        fetchedSubtasks.forEach(subtask => {
                            subtask.end_date = convertToDate(subtask.end_date);
                        });

                        // Then sort them by ascending order
                        fetchedSubtasks.sort((a, b) => {
                            return new Date(a.end_date) - new Date(b.end_date);
                        });

                        // Store the subtasks detail into the subtasks state
                        setSubtasks(fetchedSubtasks || []);
                }
                } catch (error) {
                    // Log error in refreshing task detail
                    console.error('Error refreshing task:', error);
                    // Alert error when failed to refreshing task
                    Alert.alert('Refreshing Task Error', 'Failed to refresh task.');
                }
            };
            refreshTask();
        }, [taskID])
    );

    // Display loading indicator if task are still loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading task detail...</Text>
            </View>
        );
    }
    
    // If task is null, return nothing
    if (!task) return null;
    
    return (
        // There is a difference between completed task and uncompleted task. 
        // For the completed task, it will look darker and have strike throughs in every row 
        <SafeAreaView style={[styles.container, task.status && styles.completedContainer]}>
            
            {/* Render the Subheader component */}
            <Subheader title={task.task_name} hasKebab={!task.status} itemID={task.id} itemType={'Task'} />

            {/* Scrollable content container to allow vertical scrolling */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                <View style={[styles.detailContainer, task.status && styles.completedDetailContainer]}>

                    {/* Start Date */}
                    <View style={[styles.textContainer, task.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Start Date</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.text, task.status && styles.completedText]}>{formatDate(task.start_date)}</Text>
                            <Text style={[styles.text, task.status && styles.completedText]}>{formatTime(task.start_date)}</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>

                    {/* End Date */}
                    <View style={[styles.textContainer, task.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, task.status && styles.completedText]}>End Date</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.text, task.status && styles.completedText]}>{formatDate(task.end_date)}</Text>
                            <Text style={[styles.text, task.status && styles.completedText]}>{formatTime(task.end_date)}</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>

                    {/* Duration */}
                    <View style={[styles.textContainer, task.status && styles.completedSubContainer]}>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Duration</Text>
                            <Text style={[styles.text, task.status && styles.completedText]}>{formatDuration(task.duration)}</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>

                    {/* Notes */}
                    <View style={[styles.textContainer, task.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Notes</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.text, task.status && styles.completedText]}>
                                {task.task_notes || 'No additional notes provided.'}
                            </Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>

                    {/* Group */}
                    <View style={[styles.textContainer, task.status && styles.completedSubContainer]}>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Group</Text>
                            <Text style={[styles.text, task.status && styles.completedText]}>{group?.group_name || 'N/A'}</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>
                    
                    {/* Grades for Subjects */}
                    {group?.group_type === 'Subjects' && (
                        <View style={[styles.textContainer, task.status && styles.completedSubContainer]}>
                            <View style={[styles.row, { position: 'relative' }]}>
                                <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Grades</Text>
                                <Text style={[styles.text, task.status && styles.completedText]}>{grade?.grade || 'N/A'}</Text>
                                {task.status && <View style={styles.strikeRow} />}
                            </View>
                        </View>
                    )}

                    {/* Priority */}
                    <View style={[styles.textContainer, task.status && styles.completedSubContainer]}>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Priority</Text>
                            <Text style={[styles.text, task.status && styles.completedText]}>{priority?.priority_name || 'N/A'}</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>

                    {/* Attachments */}
                    <View style={[styles.attachmentContainer, task.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Attachments</Text>
                            {task.status && <View style={styles.strikeRow} />}
                        </View>
                        <View pointerEvents={task.status ? 'none' : 'auto'} style={{ position: 'relative' }}>
                            <ViewAttachments attachments={attachments} />
                            {task.status && <View style={styles.blockOverlay} />}
                        </View>
                    </View>

                    {/* Timer button */}
                    <TouchableOpacity disabled={task.status} style={[styles.button, task.status && styles.completedSubContainer]} onPress={() => setTimerModalVisible(true)}>
                        <Text style={[styles.sectionTitle, task.status && styles.completedText]}>View Logged Time</Text>
                        <Ionicons name='time' size={32} color={task.status ? '#F5F5DC' : '#8B4513'} />
                        {task.status && <View style={styles.strikeButton} />}
                    </TouchableOpacity>

                    {/* Subtasks */}
                    <TouchableOpacity disabled={task.status} style={[styles.subtaskButton, task.status && styles.completedSubContainer]} onPress={() => navigation.navigate('AddSubtaskScreen', { taskID: task.id, task_name: task.task_name })}>
                        <Text style={[styles.sectionTitle, task.status && styles.completedText]}>Subtasks</Text>
                        <Ionicons name='add-circle-outline' size={32} color={task.status ? '#F5F5DC' : '#8B4513'} />
                        {task.status && <View style={styles.strikeButton} />}
                    </TouchableOpacity>
                    {renderSubtasks()}

                    {/* Modal for timer */}
                    <Modal
                        visible={timerModalVisible}
                        transparent
                        animationType='slide'
                        onRequestClose={() => setTimerModalVisible(false)}
                        testID='timer-modal'
                    >
                        {/* TouchableWithoutFeedback to allow pressing outside of the overlay to close the modal */}
                        <TouchableWithoutFeedback onPress={() => setTimerModalVisible(false)} testID='timer-TouchableWithoutFeedback'>
                            <View style={styles.modalOverlay}>
                                {/* TouchableWithoutFeedback to not close the modal when pressing within the overlay */}
                                <TouchableWithoutFeedback>
                                    {/* Title for the Times */}
                                    <View style={styles.timerContainer}>
                                        <Text style={styles.sectionTitle}>Time</Text>
                                        <View style={styles.line} />
                                        {/* Display each time */}
                                        <View style={styles.row}>
                                            <Text style={styles.text}>Timer</Text>
                                            <Text style={styles.text}>Date</Text>
                                            <TouchableOpacity style={styles.deleteButton}>
                                                <Ionicons name='trash' size={24} color='#FFFFFF' />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.line} />
                                    </View>
                                </TouchableWithoutFeedback>
                                {/* Button to close the add attachment modal */}
                                <TouchableOpacity
                                    onPress={() => setTimerModalVisible(false)}
                                    style={styles.closeButton}
                                    testID='timer-close'
                                >
                                    <Ionicons name='close' size={32} color='#FFFFFF' />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                    
                </View>
            </ScrollView>

            {/* Mark as Completed / Uncompleted button */}
            <View style={[styles.completeButtonContainer, task.status && styles.completedSubContainer]}>
                <TouchableOpacity style={[styles.completeButton, task.status && styles.completedButton]} onPress={toggleTaskCompletion}>
                    <Text style={[styles.completeButtonText, task.status && styles.completedButtonText]}>
                    {task.status ? 'Mark As Uncompleted' : 'Mark As Completed'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
    
const styles = StyleSheet.create({
    // Style for the container
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    // Style for the completedContainer
    completedContainer: {
        backgroundColor: '#8B4513',
    },
    // Style for the scrollContainer
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 8,
    },
    // Style for the loadingContainer
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5DC',
    },
    // Style for the detailContainer
    detailContainer: {
        flex: 1,
        backgroundColor: '#F5F5DC',
        padding: 12,
    },
    // Style for the completedDetailContainer
    completedDetailContainer: {
        backgroundColor: 'transparent',
    },
    // Style for the textContainer
    textContainer: {
        marginHorizontal: 6,
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the completedSubContainer
    completedSubContainer: {
        backgroundColor: 'transparent',
    },
    // Style for the row
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    // Style for the attachmentContainer
    attachmentContainer: {
        marginHorizontal: 6,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC',
        minHeight: 100,
    },
    // Style for the sectionTitle
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#8B4513',
    },
    // Style for the text
    text: {
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
        marginTop: 4,
    },
    // Style for the completedText
    completedText: {
        color: '#F5F5DC',
    },
    // Style for the button
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        padding: 12,
        borderColor: '#8B4513',
        borderRadius: 8,
        marginTop: 5,
        marginHorizontal: 6,
        backgroundColor: '#F5F5DC',
    },
    // Style for the subtaskButton
    subtaskButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        padding: 12,
        borderColor: '#8B4513',
        borderRadius: 8,
        marginTop: 5,
        marginHorizontal: 6,
        backgroundColor: '#F5F5DC',
    },
    // Style for the completeButtonContainer
    completeButtonContainer: {
        alignItems: 'center',
        marginBottom: 6,
        padding: 12,
        backgroundColor: '#F5F5DC',
        marginHorizontal: 6,
    },
    // Style for the completeButton
    completeButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    // Style for the completedButton
    completedButton: {
        backgroundColor: '#F5F5DC',
    },
    // Style for the completeButtonText
    completeButtonText: {
        textAlign: 'center',
        fontWeight: '800',
        color: '#FFFFFF',
        fontSize: 24,
    },
    // Style for the completedButtonText
    completedButtonText: {
        color: '#8B4513',
    },
    // Style for the modalOverlay
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
    },
    // Style for the timerContainer
    timerContainer: {
        marginHorizontal: 32,
        backgroundColor: '#F5F5DC',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#8B4513',
        minHeight: '75%',
        minWidth: '80%',
        maxHeight: '75%',
        maxWidth: '80%',
    },
    // Style for the closeButton
    closeButton: {
        marginTop: 20,
        bottom: 10,
        alignSelf: 'center',
        backgroundColor: '#8B4513',
        padding: 10,
        borderRadius: 16,
    },
    // Style for the line
    line: {
        height: 2,
        backgroundColor: '#8B4513',
        marginVertical: 8,
    },
    // Style for the deleteButton
    deleteButton: {
        backgroundColor: '#8B4513',
        borderRadius: 8,
        padding: 6,
        marginHorizontal: 8,
    },
    // Style for the strikeRow
    strikeRow: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#F5F5DC',
    },
    // Style for the strikeButton
    strikeButton: {
        position: 'absolute',
        width: '100%',
        top: '85%',
        left: 10,
        right: 0,
        height: 2,
        backgroundColor: '#F5F5DC',
    },
    // Style for the blockOverlay
    blockOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#8B4513',
        opacity: 0.8,
        zIndex: 1,
    },
    // Style for the subtasksRow
    subtasksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    // Style for the subtasksContainer
    subtasksContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        marginTop: 6,
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,        
        marginHorizontal: 6,
        backgroundColor: 'transparent',        
    },
    // Style for the subtasksCompletedContainer
    subtasksCompletedContainer: {
        backgroundColor: '#8B4513',
    },
    // Style for the subtasksText
    subtasksText: {
        fontSize: 20,
        color: '#8B4513',
        flex: 1,
        fontWeight: '500',
        overflow: 'hidden',
    },
    subtasksDateText: {
        marginRight: 10,
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the subtasksCompletedText
    subtasksCompletedText: {
        fontSize: 20,
        color: '#FFFFFF',
        flex: 1,
        fontWeight: '500',
        overflow: 'hidden',
    },
    // Style for the subtasksDateCompletedText
    subtasksDateCompletedText: {
        marginRight: 10,
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '500',
        overflow: 'hidden',
    },
    // Style for the strikeSubtasks
    strikeSubtasks: {
        position: 'absolute',
        width: '92%',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#F5F5DC',
    },
});

export default TaskDetailScreen;