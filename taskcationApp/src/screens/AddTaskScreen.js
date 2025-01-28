import React, { useEffect, useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import AddAttachments from '../components/AddAttachments';
import ViewAttachments from '../components/ViewAttachments';

import { createTask } from '../services/taskService';
import { getGroupsByCreator } from '../services/groupsService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { createAttachment } from '../services/attachmentService';
import { db } from '../../firebaseConfig';


const AddTaskScreen = () => {
    const navigation = useNavigation();

    const [userID, setUserID] = useState(null);

    // State
    const [taskName, setTaskName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);  
    const [taskNotes, setTaskNotes] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');
    const [attachments, setAttachments] = useState([]);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const [groups, setGroups] = useState([]);
    const [priorities, setPriorities] = useState([]);

    // Dropdown state
    const [groupOpen, setGroupOpen] = useState(false);
    const [priorityOpen, setPriorityOpen] = useState(false);

    useEffect(() => {
        const initialise = async () => {
            try {
                // Fetch user ID from AsyncStorage
                const storedUserID = await AsyncStorage.getItem('user_id');
                setUserID(storedUserID);

                // Fetch groups and priorities
                const userGroups = await getGroupsByCreator(db, storedUserID);
                setGroups(userGroups.map(group => ({ label: group.group_name, value: group.id })));

                const allPriorities = await getAllPriorities(db);
                const orderedPriorities = allPriorities.sort((a, b) => {
                    const priorityOrder = ['Urgent', 'High', 'Medium', 'Low', 'N/A'];
                    return priorityOrder.indexOf(a.priority_name) - priorityOrder.indexOf(b.priority_name);
                });
                setPriorities(orderedPriorities.map(priority => ({ label: priority.priority_name, value: priority.id })));
            } catch (error) {
                console.error('Error initialising AddTaskScreen:', error);
                Alert.alert('Error', 'Failed to initialise the screen.');
            }
        }

        initialise();

        const resetStates = navigation.addListener('blur', () => {
            // Reset all states when the screen loses focus
            setTaskName('');
            setStartDate(new Date());
            setEndDate(null);
            setTaskNotes('');
            setSelectedGroup('');
            setSelectedPriority('');
            setAttachments([]);
        });
    
        return resetStates;
    }, [navigation]);
    

    // Handling date/time pickers
    const handleStartDateChange = (event, date) => {
        setShowStartDatePicker(false);
        if (date) {
            setStartDate(date);
        }
    };

    const handleStartTimeChange = (event, time) => {
        setShowStartTimePicker(false);
        if (time) {
            const updatedDate = new Date(startDate);
            updatedDate.setHours(time.getHours(), time.getMinutes());
            setStartDate(updatedDate);
        }
    };

    const handleEndDateChange = (event, date) => {
        setShowEndDatePicker(false);
        if (date) {
            setEndDate((prevEndDate) => {
                const newDate = new Date(date);
                // If the user had already chosen a time, preserve it:
                if (prevEndDate) {
                    const hours = prevEndDate.getHours();
                    const minutes = prevEndDate.getMinutes();
                    newDate.setHours(hours, minutes);
                }
                return newDate;
            });
        }

    };
    
    const handleEndTimeChange = (event, time) => {
        setShowEndTimePicker(false);
        if (time) {
            // If endDate was previously set, use that as the base.
            // If endDate is still null, then fallback to startDate.
            const updatedDate = endDate ? new Date(endDate) : new Date(startDate);
            updatedDate.setHours(time.getHours(), time.getMinutes());
            setEndDate(updatedDate);
        }
    };

    // Function to format the dates into dd/mm/yyyy format
    const formatDate = (date) => {
        const formattedDate = new Date(date).toLocaleDateString('en-GB', 
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formattedDate;
    }
    const formatTime = (time) => {
        const formattedTime = new Date(time).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        return formattedTime;
    };

    const calculateDuration = (start, end) => {
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        return endTime - startTime;
    };

    const handleAttachmentsChange = (newAttachments) => {
        setAttachments(newAttachments);
    };


    const handleAddTask = async () => {
        if (!taskName) {
            Alert.alert('Incomplete Task', 'Please enter the Task Name.');
            return;
        }

        if (!endDate) {
            Alert.alert('Incomplete Task', 'Please select an End Date and Time.');
            return;
        }

        if (endDate <= startDate) {
            Alert.alert('Invalid Date', 'End Date must be on or after the Start Date.');
            return;
        }

        if (!selectedGroup) {
            Alert.alert('Incomplete Task', 'Please select a Group.');
            return;
        }

        const duration = calculateDuration(startDate, endDate);
        console.log("duration:", duration);

        try {
            const taskID = await createTask(db, {
                task_name: taskName,
                created_by: userID,
                start_date: startDate,
                end_date: endDate,
                duration: duration,
                task_notes: taskNotes,
                group_id: selectedGroup,
                priority_id: selectedPriority,
                status: false,
                attachments: [],
            });

            console.log('Task created with ID:', taskID);

            if (attachments.length > 0) {
                const attachmentPromises = attachments.map((attachment) =>
                    createAttachment(db, {
                        task_id: taskID,
                        file_name: attachment.file_name,
                        file_type: attachment.file_type,
                        uri: attachment.uri,
                        size: attachment.size,
                        durationMillis: attachment.durationMillis || null,
                    })
                );

                await Promise.all(attachmentPromises);
            }
            
            // **Clear the form before navigating back**
            setTaskName('');
            setStartDate(new Date());
            setEndDate(null);
            setTaskNotes('');
            setSelectedGroup('');
            setSelectedPriority('');
            setAttachments([]);

            Alert.alert('Success', 'Task created successfully!');
            navigation.goBack();
        } catch (error) {
            console.log('Error creating task or attachments:', error);
            Alert.alert('Error', 'Failed to create the task or attachments.');
        }
    };

    // Delete attachment handler
    const handleDeleteAttachment = (attachment) => {
        setAttachments((prev) =>
            prev.filter((item) => item.uri !== attachment.uri)
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back arrow and title */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name='arrow-back' size={24} color='#FFFFFF' />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Task</Text>

            </View>
            
            <TouchableWithoutFeedback onPress={() => { setGroupOpen(false); setPriorityOpen(false);} }
            >
                <View style={styles.contentContainer}>

                    {/* Task Name */}
                    <TextInput
                        style={styles.textInput}
                        placeholder='Task Name'
                        placeholderTextColor='#A5734D'
                        value={taskName}
                        onChangeText={setTaskName}
                    />

                    {/* Row for Start date/time */}
                    <View style={styles.dateTimeRow}>
                        <TouchableOpacity style={[styles.dateTimeButton]} onPress={() => setShowStartDatePicker(true)}>
                            <Text style={styles.text}>{formatDate(startDate)}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={[styles.dateTimeButton]} onPress={() => setShowStartTimePicker(true)}>
                            <Text style={styles.text}>{formatTime(startDate)}</Text>
                        </TouchableOpacity>
                        
                    </View>
                    {showStartDatePicker && (
                        <DateTimePicker
                            testID="startDatePicker"
                            value={startDate}
                            mode='date'
                            display='default'
                            onChange={handleStartDateChange}
                        />
                    )}
                    {showStartTimePicker && (
                        <DateTimePicker
                            testID="startTimePicker"
                            value={startDate}
                            mode='time'
                            display='spinner'
                            onChange={handleStartTimeChange}
                        />
                    )}


                    {/* Row for End date/time */}
                    <View style={styles.dateTimeRow}>
                    <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                        <Text style={!endDate ? styles.placeholderText : styles.text}>
                            { !endDate ? 'End Date' : formatDate(endDate) }
                        </Text>
                    </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                        <Text style={!endDate ? styles.placeholderText : styles.text}>
                            { !endDate ? 'End Time' : formatTime(endDate) }
                        </Text>
                        </TouchableOpacity>
                    </View>
                    {showEndDatePicker && (
                        <DateTimePicker
                            testID="endDatePicker"
                            value={endDate || startDate}
                            mode='date'
                            display='default'
                            onChange={handleEndDateChange}
                        />
                    )}
                    {showEndTimePicker && (
                        <DateTimePicker
                            testID="endTimePicker"
                            value={endDate || startDate}
                            mode='time'
                            display='spinner'
                            onChange={handleEndTimeChange}
                        />
                    )}

                    {/* Task Notes */}
                    <TextInput
                        style={[styles.textInput, styles.notesInput]}
                        placeholder='Task Notes.....'
                        placeholderTextColor='#A5734D'
                        multiline
                        value={taskNotes}
                        onChangeText={setTaskNotes}
                    />

                    {/* Dropdown for Groups */}
                    <View style={[styles.pickerContainer, { zIndex: groupOpen ? 2000 : 0 }]}>
                        <DropDownPicker
                            open={groupOpen}
                            value={selectedGroup}
                            items={groups}
                            setOpen={setGroupOpen}
                            setValue={setSelectedGroup}
                            setItems={setGroups}
                            placeholder='Groups'
                            onOpen={() => {
                                setPriorityOpen(false);
                            }}

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
                            onOpen={() => {
                                setGroupOpen(false);
                            }}
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

                    {/* Attachment */}
                    <View style={styles.attachmentContainer}>
                        <AddAttachments attachments={attachments} onAttachmentsChange={handleAttachmentsChange} testID="insert-attachment-button"/>
                        <ViewAttachments
                            attachments={attachments}
                            onDeleteAttachment={handleDeleteAttachment}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            

            

            {/* Add Button */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B4513',
        padding: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    textInput: {
        borderWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#FFF8DC',
        color: '#8B4513',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: 16,
        marginTop: 12,
        height: 50,
        fontSize: 20,
        fontWeight: '500',
    },
    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },
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
        backgroundColor: '#FFF8DC',
    },
    text: {
        color: '#8B4513',
        fontSize: 20,
        fontWeight: '500',
    },
    placeholderText: {
        color: '#A5734D',
        fontSize: 20,
        fontWeight: '500',
    },
    pickerContainer: {
        marginHorizontal: 16,
        marginTop: 12,
    },
    dropdownContainer: {
        borderWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#FFF8DC',
    },
    dropdown: {
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 10,
        backgroundColor: '#FFF8DC',
    },
    attachmentContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 12,
    },
    addButtonContainer: {
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F5F5DC',
    },
    addButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    addButtonText: {
        fontWeight: '800',
        color: '#FFFFFF',
        fontSize: 24,
    },
});

export default AddTaskScreen;