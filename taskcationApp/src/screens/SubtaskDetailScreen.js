// Import dependencies and libraries used in Subtask Detail Screen
import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    StyleSheet,
    Modal,
    FlatList,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect  } from '@react-navigation/native';
import Subheader from '../components/Subheader';
import Ionicons from '@expo/vector-icons/Ionicons';
import ViewAttachments from '../components/ViewAttachments';
import { getSubtaskByID, updateSubtask } from '../services/subtaskService';
import { getPriorityByID } from '../services/priorityLevelsService';
import { getAttachmentsBySubtaskID } from '../services/attachmentService';
import { getTimeRecordsBySubtask, deleteTimeRecord } from '../services/timeTrackingService';
import { db } from '../../firebaseConfig';

const SubtaskDetailScreen = () => {
    // Access the route  object to get the subtaskID passed from navigation
    const route = useRoute();
    const { subtaskID,  showTimerModal } = route.params;

    // Access the navigation object
    const navigation = useNavigation();

    // State to control the timer modal
    const [timerModalVisible, setTimerModalVisible] = useState(false);
    
    // State for storing subtask details
    const [subtask, setSubtask] = useState(null);
    
    // State for storing priority details
    const [priority, setPriority] = useState(null);
    
    // State for storing attachments
    const [attachments, setAttachments] = useState([]);

    // State to store time records
    const [timeRecords, setTimeRecords] = useState([]);
    
    // State for loading status
    const [loading, setLoading] = useState(true);

    // useEffect to fetch subtask on component mount
    useEffect(() => {
        fetchSubtask();
    }, [subtaskID]);

    // useEffect to fetch other related data using subtask details such as priority, attachments, time
    useEffect(() => {
        // Check if there is subtask
        if (!subtask) return; 

        fetchPriority();
        fetchAttachments();
        fetchTimeRecords();
    }, [subtask]); 

    useEffect(() => {
        if (showTimerModal) {
            setTimerModalVisible(true);
        }
    }, [showTimerModal]);

    // Function to fetch subtask details from database
    const fetchSubtask = async () => {
        try {
            // Fetch the subtask details from the Firebase database based on subtaskID
            const fetchedSubtask = await getSubtaskByID(db, subtaskID);
            if (fetchedSubtask) {
                // Store the subtask details into the subtask state
                setSubtask({ id: subtaskID, ...fetchedSubtask });
            } 
        } catch (error) {
            // Log error in fetching subtask details
            console.error('Error fetching subtask:', error);
            // Alert error when failed to fetch subtask
            Alert.alert('Fetching Subtask Error', 'Failed to fetch subtask.');
        } finally {
            // Set loading state to false
            setLoading(false);
        }
        
    };

    // Function to fetch priority details from database
    const fetchPriority = async () => {
        try {
            // Fetch the priority details from the Firebase database based on priorityID in subtask
            if (subtask.priority_id) {
                const fetchedPriority = await getPriorityByID(db, subtask.priority_id);
                if (fetchedPriority) {
                    // Store the priority detail into the priority state
                    setPriority({ id: subtask.priority_id, ...fetchedPriority });
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
            // Fetch the attachments from the Firebase database based on subtaskID
            const fetchedAttachments = await getAttachmentsBySubtaskID(db, subtaskID);
            // Store the attachments into the attachments state
            setAttachments(fetchedAttachments || []);
        } catch (error) {
            // Log error in fetching attachments
            console.error('Error fetching attachments:', error);
            // Alert error when failed to fetch attachments
            Alert.alert('Fetching Attachments Error', 'Failed to fetch attachments.');
        }
    };

    // Function to fetch time records from database
    const fetchTimeRecords = async () => {
        try {
            // Fetch the time record from the Firebase database based on subtaskID
            const fetchedTimeRecord = await getTimeRecordsBySubtask(db, subtaskID);

            // Convert the end date to a JS date
            fetchedTimeRecord.forEach(time => {
                time.created_at = convertToDate(time.created_at);
            });

            // Then sort them by ascending order
            fetchedTimeRecord.sort((a, b) => {
                return new Date(a.created_at) - new Date(b.created_at);
            });

            // Store the time record into the time record state
            setTimeRecords(fetchedTimeRecord || []);
        } catch (error) {
            // Log error in fetching time record
            console.error('Error fetching time record:', error);
            // Alert error when failed to fetch time record
            Alert.alert('Fetching Time Record Error', 'Failed to fetch time record.');
        }
    };

    // Function to render time records 
    const renderTimeRecord = ({ item }) => {
        return (
            // Time records container for each time
            <View style={styles.timeRecordsContainer}>
                {/* Time records row to align the name, date and delete button correctly */}
                <View style={styles.timeRecordsRow}>
                    {/* Time record duration */}
                    <Text style={styles.timeRecordDurationText}>
                        {formatTimer(item.duration)}
                    </Text>
                    {/* Time record date */}
                    <Text style={styles.timeRecordDateText}>
                        {formatDate(item.created_at)}
                    </Text>
                    {/* Delete button */}
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton} testID={`delete-${item.id}`}>
                        <Ionicons name="trash" size={24} color="#F5F5DC" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Function to handle deleting time record with a confirmation alert
    const handleDelete = async (time) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete time?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Remove it from the time shown on screen.
                            setTimeRecords(prev => prev.filter(item => item.id !== time.id));
                            // Delete the selected time record
                            await deleteTimeRecord(db, time.id);
                        } catch (error) {
                            // Log error in deleting time record
                            console.error('Error deleting time record:', error);
                            // Alert error when failed to delete time record
                            Alert.alert('Deleting Time Record Error', 'Failed to delete the time record.');
                        }
                    }
                }
            ]
        );
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

    // Function to format timer as HH:MM:SS:MS
    const formatTimer = (msValue) => {
        // Calculate the total seconds
        const totalSeconds = Math.floor(msValue / 1000);
        // Calculate and format the hours
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        // Calculate and format the minutes
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        // Calculate and format the seconds
        const seconds = String((totalSeconds % 60)).padStart(2, '0');
        // Calculate and format the milliseconds
        const milliseconds = String(Math.floor((msValue % 1000)/10)).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    // Function to mark subtask as completed/uncompleted
    const toggleSubtaskCompletion = async () => {
        try {
            // Change the status
            const newStatus = !subtask.status;
            // Update the subtask status in the Firebase database
            await updateSubtask(db, subtaskID, { status: newStatus });
    
            // Change the status in the subtask state
            setSubtask((prev) => ({ ...prev, status: newStatus }));

            // Alert confirmation of marking subtask as completed or uncompleted
            Alert.alert('Success', newStatus ? 'Subtask marked as completed.' : 'Subtask marked as uncompleted.');
        } catch (error) {
            // Log any errors when updating subtask status
            console.error('Error updating subtask:', error);
            // Alert error when failed to update subtask status
            Alert.alert('Update Subtask Error', 'Failed to update subtask.');
        }
    };

    // useFocusEffect to refresh subtask detail whenever the screen is focused
    useFocusEffect(
        // useCallback ensures that the function does not get recreated unnecessarily
        useCallback(() => {
            // Function to refresh subtask details
            const refreshTask = async () => {
                try {
                    // Fetch the subtask details from the Firebase database based on subtaskID
                    const fetchedSubtask = await getSubtaskByID(db, subtaskID);
                    // Check if there is a subtask
                    if (fetchedSubtask) {
                        // Store the subtask detail into the subtask state
                        setSubtask({ id: subtaskID, ...fetchedSubtask });

                        // Fetch the priority details from the Firebase database based on priorityID in fetchedTask
                        if (fetchedSubtask.priority_id) {
                            const fetchedPriority = await getPriorityByID(db, fetchedSubtask.priority_id);
                            if (fetchedPriority) {
                                // Store the priority detail into the priority state
                                setPriority({ id: fetchedSubtask.priority_id, ...fetchedPriority });
                            }
                        }

                        // Call necessary function to refresh screen
                        fetchAttachments();
                        fetchTimeRecords();
                }
                } catch (error) {
                    // Log error in refreshing subtask details
                    console.error('Error refreshing subtask details:', error);
                    // Alert error when failed to refreshing subtask details
                    Alert.alert('Refreshing Subtask Details Error', 'Failed to refresh subtask details.');
                }
            };
            refreshTask();
        }, [subtaskID])
    );

    // Display loading indicator if subtask are still loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading subtask detail...</Text>
            </View>
        );
    }
    
    // If subtask is null, return nothing
    if (!subtask) return null;

    return (
        // There is a difference between completed subtask and uncompleted subtask. 
        // For the completed subtask, it will look darker and have strike throughs in every row 
        <SafeAreaView style={[styles.container, subtask.status && styles.completedContainer]}>
            {/* Render the Subheader component */}
            <Subheader title={subtask.subtask_name} hasKebab={!subtask.status} itemID={subtask.id} itemType={'Subtask'} />

            {/* Scrollable content container to allow vertical scrolling */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                <View style={[styles.detailContainer, subtask.status && styles.completedDetailContainer]}>
                    {/* Start Date */}
                    <View style={[styles.textContainer, subtask.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>Start Date</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>{formatDate(subtask.start_date)}</Text>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>{formatTime(subtask.start_date)}</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>
                    
                    {/* End Date */}
                    <View style={[styles.textContainer, subtask.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>End Date</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>{formatDate(subtask.end_date)}</Text>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>{formatTime(subtask.end_date)}</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>
                    
                    {/* Duration */}
                    <View style={[styles.textContainer, subtask.status && styles.completedSubContainer]}>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>Duration</Text>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>{formatDuration(subtask.duration)}</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>
                    
                    {/* Notes */}
                    <View style={[styles.textContainer, subtask.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>Notes</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>
                                {subtask.subtask_notes || 'No additional notes provided.'}
                            </Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>
                    
                    {/* Task the subtask belongs to */}
                    <View style={[styles.textContainer, subtask.status && styles.completedSubContainer]}>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>Task</Text>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>{subtask.task_name}</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>
                    
                    {/* Priority */}
                    <View style={[styles.textContainer, subtask.status && styles.completedSubContainer]}>
                        <View style={[styles.row, { position: 'relative' }]}>
                            <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>Priority</Text>
                            <Text style={[styles.text, subtask.status && styles.completedText]}>{priority?.priority_name || 'N/A'}</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                    </View>
                    
                    {/* Attachments */}
                    <View style={[styles.attachmentContainer, subtask.status && styles.completedSubContainer]}>
                        <View style={{ position: 'relative' }}>
                            <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>Attachments</Text>
                            {subtask.status && <View style={styles.strikeRow} />}
                        </View>
                        <View pointerEvents={subtask.status ? 'none' : 'auto'} style={{ position: 'relative' }}>
                            <ViewAttachments attachments={attachments} />
                            {subtask.status && <View style={styles.blockOverlay} />}
                        </View>
                    </View>
                    
                    {/* Timer button */}
                    <TouchableOpacity disabled={subtask.status} style={[styles.button, subtask.status && styles.completedSubContainer]} onPress={() => setTimerModalVisible(true)}>
                        <Text style={[styles.sectionTitle, subtask.status && styles.completedText]}>View Logged Time</Text>
                        <Ionicons name='time' size={32} color={subtask.status ? '#F5F5DC' : '#8B4513'} />
                        {subtask.status && <View style={styles.strikeButton} />}
                    </TouchableOpacity>

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
                                        <TouchableOpacity style={styles.addTimeButton}  onPress={() => {setTimerModalVisible(false); navigation.navigate('BottomTab', { screen: 'Timer' });}}>
                                            <Text style={styles.sectionTitle}>Time</Text>
                                            <Ionicons name='add-circle-outline' size={32} color='#8B4513' />
                                        </TouchableOpacity>
                                        {/* Display each time */}
                                        <FlatList
                                            data={timeRecords}
                                            renderItem={renderTimeRecord}
                                            keyExtractor={(item) => item.id.toString()}
                                            contentContainerStyle={styles.timeRecordsList}
                                            ListEmptyComponent={
                                                <Text style={styles.emptyText}>
                                                    No Time Added!
                                                </Text>
                                            }
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                                {/* Button to close the add attachment modal */}
                                <TouchableOpacity
                                    onPress={() => setTimerModalVisible(false)}
                                    style={styles.closeButton}
                                    testID='timer-close'
                                >
                                    <Ionicons name='close' size={32} color='#F5F5DC' />
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                
                </View>
            </ScrollView>

            {/* Mark as Completed / Uncompleted button */}
            <View style={[styles.completeButtonContainer, subtask.status && styles.completedSubContainer]}>
                <TouchableOpacity style={[styles.completeButton, subtask.status && styles.completedButton]} onPress={toggleSubtaskCompletion}>
                    <Text style={[styles.completeButtonText, subtask.status && styles.completedButtonText]}>
                    {subtask.status ? 'Mark As Uncompleted' : 'Mark As Completed'}
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
    // Style for the addTimeButton
    addTimeButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        padding: 8,
        borderColor: '#8B4513',
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
        color: '#F5F5DC',
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
    // Style for the timeRecordsContainer
    timeRecordsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#F5F5DC',
    },
    // Style for the timeRecordsRow
    timeRecordsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    // Style for the timeRecordDurationText
    timeRecordDurationText: {
        fontSize: 20,
        color: '#8B4513',
        flex: 1,
        fontWeight: '500',
    },
    // Style for the timeRecordDateText
    timeRecordDateText: {
        marginRight: 10,
        fontSize: 20,
        color: '#8B4513',
        fontWeight: '500',
    },
    // Style for the timeRecordsList
    timeRecordsList: {
        paddingBottom: 20,
    },
    // Style for the emptyText
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#8B4513',
        fontSize: 18,
        fontWeight: '600',
    },
});
export default SubtaskDetailScreen;