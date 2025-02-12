// Import dependencies and libraries used in Subtask Detail Screen
import React, { useEffect, useState, useCallback } from 'react';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute  } from '@react-navigation/native';
import Subheader from '../components/Subheader';
import AddAttachments from '../components/AddAttachments';
import ViewAttachments from '../components/ViewAttachments';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { getSubtaskByID, updateSubtask } from '../services/subtaskService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { getAttachmentsBySubtaskID, createAttachment, deleteAttachment } from '../services/attachmentService';
import { db } from '../../firebaseConfig';

const EditSubtaskScreen = () => {
    // Access the route  object to get the subtaskID passed from navigation
    const route = useRoute();
    const { subtaskID } = route.params;

    // Access the navigation object
    const navigation = useNavigation();

    // State to store user ID
    const [userID, setUserID] = useState(null);

    // State for storing the subtask name 
    const [subtaskName, setSubtaskName] = useState('');
        
    // State for storing the subtask start date 
    const [startDate, setStartDate] = useState(new Date());

    // State for storing the subtask end date 
    const [endDate, setEndDate] = useState(null);

    // State for storing the subtask notes 
    const [subtaskNotes, setSubtaskNotes] = useState('');

    // State for storing the subtask priority
    const [selectedPriority, setSelectedPriority] = useState('');


    // State for storing the subtask name 
    const [taskID, setTaskID] = useState('');

    // State for date pickers visibility
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // State for storing priorities from database
    const [priorities, setPriorities] = useState([]);

    // State for dropdown visibilities
    const [priorityOpen, setPriorityOpen] = useState(false);

    // State for storing the attachments
    const [attachments, setAttachments] = useState([]);
    const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);

    // State for loading status
    const [loading, setLoading] = useState(true);

    // useEffect to initialise user and fetch groups and priorities on component mount
    useEffect(() => {
        const initialise = async () => {
            try {
                // Retrieve the user ID from AsyncStorage
                const storedUserID = await AsyncStorage.getItem('user_id');
                // Set user ID in state
                setUserID(storedUserID);

                // Fetch all priorities from the database
                const allPriorities = await getAllPriorities(db);
                // Sort the priority in their order
                const orderedPriorities = allPriorities.sort((a, b) => {
                    const priorityOrder = ['Urgent', 'High', 'Medium', 'Low', 'N/A'];
                    return priorityOrder.indexOf(a.priority_name) - priorityOrder.indexOf(b.priority_name);
                });
                // Map priorities to dropdown format
                setPriorities(orderedPriorities.map(priority => ({ label: priority.priority_name, value: priority.id })));
            } catch (error) {
                // Log any errors when initialising user and priorities
                console.error('Initialisation User and Priorities Error:', error);
                // Set error if initialising fails
                Alert.alert('Initialising User and Priorities Error', 'Failed to initialise user and priorities.');
            }
        }

        initialise();
    }, []);

    // useEffect to fetch subtask on component mount
    useEffect(() => {
        // Function to fetch subtask details from database
        const fetchSubtask = async () => {
            try {
                // Fetch the subtask details from the Firebase database based on subtaskID
                const fetchedSubtask = await getSubtaskByID(db, subtaskID);
                // Check if there is a subtask
                if (fetchedSubtask) {
                    // Store subtask details into their respective states
                    setSubtaskName(fetchedSubtask.subtask_name);
                    setStartDate(convertToDate(fetchedSubtask.start_date));
                    setEndDate(convertToDate(fetchedSubtask.end_date));
                    setSubtaskNotes(fetchedSubtask.subtask_notes);
                    setSelectedPriority(fetchedSubtask.priority_id);
                    setTaskID(fetchedSubtask.task_id);
                    // Fetch the attachments from the Firebase database based on subtaskID in subtask
                    const fetchedAttachments = await getAttachmentsBySubtaskID(db, subtaskID);
                    // Store the attachments into the attachments state
                    setAttachments(fetchedAttachments || []);
                }
            } catch (error) {
                // Log error in fetching subtask details
                console.error('Error fetching subtask details:', error);
                // Alert error when failed to fetch subtask details
                Alert.alert('Fetching Subtask Details Error', 'Failed to fetch subtask details.');
            } finally {
                // Set loading state to false
                setLoading(false);
            }
        };
    
        fetchSubtask();
    }, [subtaskID]);

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

    // Function to handle start date change when picking start date
    const handleStartDateChange = (event, date) => {
        // Hide the start date picker
        setShowStartDatePicker(false);
        if (date) {
            // Update the start date
            setStartDate(date);
        }
    };

    // Function to handle start time change when picking start time
    const handleStartTimeChange = (event, time) => {
        // Hide the start time picker
        setShowStartTimePicker(false);
        if (time) {
            const updatedDate = new Date(startDate);
            updatedDate.setHours(time.getHours(), time.getMinutes());
            // Update the start time
            setStartDate(updatedDate);
        }
    };

    // Function to handle end date change when picking end date
    const handleEndDateChange = (event, date) => {
        // Hide the end date picker
        setShowEndDatePicker(false);
        if (date) {
            // Update the end date
            setEndDate((prevEndDate) => {
                const newDate = new Date(date);
                if (prevEndDate) {
                    const hours = prevEndDate.getHours();
                    const minutes = prevEndDate.getMinutes();
                    newDate.setHours(hours, minutes);
                }
                return newDate;
            });
        }
    };
    
    // Function to handle end time change when picking end time
    const handleEndTimeChange = (event, time) => {
        // Hide the end time picker
        setShowEndTimePicker(false);
        if (time) {
            const updatedDate = new Date(endDate) ;
            updatedDate.setHours(time.getHours(), time.getMinutes());
            // Update the end time
            setEndDate(updatedDate);
        }
    };

    // Function to calculate the duration in milliseconds between the start date and end date
    const calculateDuration = (start, end) => {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return endTime - startTime;
    };

    // Function to handle updating the list of attachments
    const handleAttachmentsChange = (newAttachments) => {
        setAttachments(newAttachments);
    };

    // Function to handle deleting attachment from the list
    const handleDeleteAttachment = async (attachment) => {
        // Remove it from the attachments shown on screen.
        setAttachments(prev => prev.filter(item => item.uri !== attachment.uri));
        // If the attachment already exists in the database, mark it for deletion
        if (attachment.id) {
            setAttachmentsToDelete(prev => [...prev, attachment]);
        }
    };

    // Function to handle updating subtask and attachments into the database
    const handleUpdateTask = async () => {
        // Validate if subtask name is entered
        if (!subtaskName) {
            // Alert error when subtask name is not entered
            Alert.alert('Incomplete Subtask', 'Please enter the Subtask Name.');
            return;
        }

        // Validate if subtask end date is selected
        if (!endDate) {
            // Alert error when subtask end date is not selected
            Alert.alert('Incomplete Subtask', 'Please select an End Date and Time.');
            return;
        }

        // Validate if subtask end date is after or equal to subtask start date
        if (endDate <= startDate) {
            // Alert error when subtask end date is after or equal to subtask start date
            Alert.alert('Invalid Date', 'End Date must be on or after the Start Date.');
            return;
        }

        // Calculate the subtask duration
        const duration = calculateDuration(startDate, endDate);
        
        try {
            // Update subtask details with the updated details and store it in the database
            await updateSubtask(db, subtaskID, {
                subtask_name: subtaskName,
                start_date: startDate,
                end_date: endDate,
                duration: duration,
                subtask_notes: subtaskNotes,
                priority_id: selectedPriority,
            });

            // Check whether there are any new attachments
            const newAttachments = attachments.filter(att => !att.id);
            // If there are new attachments, store them into the database
            if (newAttachments.length > 0) {
                const attachmentPromises = attachments.map(attachment =>
                    createAttachment(db, {
                        task_id: taskID,
                        subtask_id: subtaskID,
                        file_name: attachment.file_name,
                        file_type: attachment.file_type,
                        uri: attachment.uri,
                        size: attachment.size,
                        durationMillis: attachment.durationMillis || null,
                    })
                );
                // Wait for all attachments to be stored
                await Promise.all(attachmentPromises);
            }

            // If there are attachments to be deleted, delete them from the database on update
            if (attachmentsToDelete.length > 0) {
                // Delete the attachments to be deleted, one by one
                const deletePromises = attachmentsToDelete.map(attachment => deleteAttachment(db, attachment.id));
                // Wait for all attachments to be deleted
                await Promise.all(deletePromises);
            }

            // Alert success when subtask is created successfully
            Alert.alert('Success', 'Subtask updated successfully!');
            // Navigate back to the previous screen
            navigation.goBack();
        } catch (error) {
            // Log any errors when updating subtask or attachments
            console.error('Error updating subtask:', error);
            // Alert error for updating subtask or attachments 
            Alert.alert('Update Error', 'Failed to update the subtask.');
        }
    };

    // Display loading indicator if tasks are still loading
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading subtask detail...</Text>
            </View>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            {/* Render the Subheader component */}
            <Subheader title='Edit Subtask' hasKebab={false} />
            {/* TouchableWithoutFeedback to allow pressing outside of the dropdowns to close the dropdowns */}
            <TouchableWithoutFeedback onPress={() =>  setPriorityOpen(false)}>
                <View style={styles.contentContainer}>
                    {/* Subtask Name */}
                    <TextInput
                        style={styles.textInput}
                        placeholder='Subtask Name'
                        placeholderTextColor='#A5734D'
                        value={subtaskName}
                        onChangeText={setSubtaskName}
                    />

                    {/* Row for start date and time*/}
                    <View style={styles.dateTimeRow}>
                        {/* Start date button */}
                        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                            <Text style={styles.text}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                        {/* Start time button */}
                        <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                            <Text style={styles.text}>{formatTime(startDate)}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Conditional rendering of the start date and time pickers */}
                    {showStartDatePicker && (
                        <DateTimePicker
                            testID='startDatePicker'
                            value={new Date(startDate)}
                            mode='date'
                            display='default'
                            onChange={handleStartDateChange}
                        />
                    )}
                    {showStartTimePicker && (
                        <DateTimePicker
                            testID='startTimePicker'
                            value={new Date(startDate)}
                            mode='time'
                            display='spinner'
                            onChange={handleStartTimeChange}
                    />
                    )}

                    {/* Row for end date and time */}
                    <View style={styles.dateTimeRow}>
                        {/* End date button */}
                        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                            <Text style={styles.text}>{formatDate(endDate)}</Text>
                        </TouchableOpacity>
                        {/* End time button */}
                        <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                            <Text style={styles.text}>{formatTime(endDate)}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Conditional rendering of the end date and time pickers */}
                    {showEndDatePicker && (
                        <DateTimePicker
                            testID='endDatePicker'
                            value={endDate ? new Date(endDate) : new Date(startDate)}
                            mode='date'
                            display='default'
                            onChange={handleEndDateChange}
                        />
                    )}
                    {showEndTimePicker && (
                        <DateTimePicker
                            testID='endTimePicker'
                            value={endDate ? new Date(endDate) : new Date(startDate)}
                            mode='time'
                            display='spinner'
                            onChange={handleEndTimeChange}
                        />
                    )}

                    {/* Subtask Notes */}
                    <TextInput
                        style={[styles.textInput, styles.notesInput]}
                        placeholder='Subtask Notes.....'
                        placeholderTextColor='#A5734D'
                        multiline
                        value={subtaskNotes}
                        onChangeText={setSubtaskNotes}
                    />

                    {/* Dropdown for Priority Levels */}
                    <View style={[styles.pickerContainer, { zIndex: priorityOpen ? 1000 : 0 }]}>
                        <DropDownPicker
                            open={priorityOpen}
                            value={selectedPriority}
                            items={priorities}
                            setOpen={setPriorityOpen}
                            setValue={setSelectedPriority}
                            setItems={setPriorities}
                            placeholder='Priority Level'
                            onOpen={() => setGroupOpen(false)}
                            closeAfterSelecting={true}
                            closeOnBackPressed={true}
                            closeOnBlur={true}
                            style={styles.dropdown}
                            placeholderStyle={styles.text}
                            textStyle={styles.text}
                            dropDownContainerStyle={styles.dropdownContainer}
                            listMode='SCROLLVIEW'
                            maxHeight={200}
                        />
                    </View>

                    {/* Attachments */}
                    <View style={styles.attachmentContainer}>
                        {/* Add Attachments Component */}
                        <AddAttachments attachments={attachments} onAttachmentsChange={handleAttachmentsChange}/>
                        {/* View Attachments Component */}
                        <ViewAttachments attachments={attachments} onDeleteAttachment={handleDeleteAttachment}/>
                    </View>
                    
                </View>
            </TouchableWithoutFeedback>

            {/* Update Button */}
            <View style={styles.updateButtonContainer}>
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdateTask}>
                    <Text style={styles.updateButtonText}>Update</Text>
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
    // Style for the contentContainer
    contentContainer: {
        flexGrow: 1,
    },
    // Style for the textInput
    textInput: {
        borderWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#F5F5DC',
        color: '#8B4513',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: 16,
        marginTop: 12,
        height: 50,
        fontSize: 20,
        fontWeight: '500',
    },
    // Style for the notesInput
    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    // Style for the dateTimeRow
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginTop: 12,
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the text
    text: {
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
    },
    // Style for the container
    placeholderText: {
        color: '#A5734D',
        fontSize: 20,
        fontWeight: '500',
    },
    // Style for the pickerContainer
    pickerContainer: {
        marginHorizontal: 16,
        marginTop: 12,
    },
    // Style for the container
    dropdownContainer: {
        borderWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#F5F5DC',
    },
    // Style for the dropdown
    dropdown: {
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the attachmentContainer
    attachmentContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 12,
        maxHeight: 200,
    },
    // Style for the updateButtonContainer
    updateButtonContainer: {
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F5F5DC',
    },
    // Style for the updateButton
    updateButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    // Style for the updateButtonText
    updateButtonText: {
        fontWeight: '800',
        color: '#F5F5DC',
        fontSize: 24,
    },
});

export default EditSubtaskScreen;