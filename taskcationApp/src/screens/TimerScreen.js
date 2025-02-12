// Import dependencies and libraries used in Timer Screen
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    FlatList,
    Alert,
    TouchableWithoutFeedback,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Header from '../components/Header';
import { getTasksByCreator } from '../services/taskService';
import { getSubtasksByCreator } from '../services/subtaskService';
import { createTimeRecord } from '../services/timeTrackingService';
import { db } from '../../firebaseConfig';

const TimerScreen = () => {
    // Access the navigation object
    const navigation = useNavigation();

    // Hook for rerendering the screen
    const isFocused = useIsFocused();

    // State to store user ID
    const [userID, setUserID] = useState(null);
    
    // State for tracking if recording time is in progress
    const [isRecording, setIsRecording] = useState(false);

    // State for tracking if record timing is paused
    const [isPaused, setIsPaused] = useState(false);

    // State for recording time duration
    const [timer, setTimer] = useState(0);

    // Reference for managing the timer interval
    const intervalRef = useRef(null);
    
    // Reference for tracking start time
    const startTimeRef  = useRef(0);

    // Reference for tracking paused duration
    const savedTimeRef  = useRef(0);

    // State to store the current active tab, tasks or subtasks
    const [activeTab, setActiveTab] = useState('Tasks');

    // State for storing the tasks 
    const [tasks, setTasks] = useState([]);

    // State for storing the subtasks 
    const [subtasks, setSubtasks] = useState([]);

    // State for storing the filtered list based on active tab, tasks or subtasks
    const [filteredList, setFilteredList] = useState([]);

    // State to store the search query for filtering tasks or subtasks
    const [searchQuery, setSearchQuery] = useState('');

    // State to control the save timer modal
    const [saveTimerModal, setSaveTimerModal] = useState(false);
    
    // useEffect to initialise user and fetch groups on component mount
    useEffect(() => {
        initialise();
    }, []);

    useEffect(() => {
        // Call the initialise function whenever isFocused changes
        if (isFocused) {
            initialise();
        }
    }, [isFocused]);

    // useEffectto update filtered list when activeTab or original lists changes
    useEffect(() => {
        if (activeTab === 'Tasks') {
            setFilteredList(tasks);
        } else {
            setFilteredList(subtasks);
        }
        // Clear any previous search query when switching tabs
        setSearchQuery('');
    }, [activeTab, tasks, subtasks]);

    // Function to initialise user, tasks and subtasks
    const initialise = async () => {
        try {
            // Retrieve the user ID from AsyncStorage
            const storedUserID = await AsyncStorage.getItem('user_id');
            // Set user ID in state
            setUserID(storedUserID);

            // Fetch user's tasks from the database
            const fetchedTasks = await getTasksByCreator(db, storedUserID);

            // Fetch user's subtasks from the database
            const fetchedSubtasks = await getSubtasksByCreator(db, storedUserID);

            // Filter them according to their status, show only uncompleted tasks or subtasks
            setTasks((fetchedTasks || []).filter(task => !task.status));
            setSubtasks((fetchedSubtasks || []).filter(subtask => !subtask.status));
        } catch (error) {
            // Log error in fetching tasks or subtasks
            console.log('Error fetching tasks or subtasks: ', error);
            // Alert error when failed to fetch tasks or subtasks
            Alert.alert('Error Fetching Tasks or Subtasks', 'Failed to fetch tasks or subtasks.');
        }
    }

    // Function to start the timer
    const startTimer = () => {
        // Prevent multiple intervals
        if (intervalRef.current) return;

        // Set recording time state to true
        setIsRecording(true);
        // Set pausing time state to false
        setIsPaused(false);
        
        // Set start time reference 
        startTimeRef.current = Date.now();

        // Start interval to update timer ever 10 milliseconds
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const newElapsed = savedTimeRef.current + (now - startTimeRef.current);
            setTimer(newElapsed);
        }, 10);
    };

    // Function to pause the timer
    const pauseTimer = () => {
        // Prevent multiple intervals
        if (!intervalRef.current) return;

        // Clear the interval
        clearInterval(intervalRef.current);
        // Reset the interval reference
        intervalRef.current = null;

        // Set pausing time state to true
        setIsPaused(true);

        // Set saved time reference to timer duration
        savedTimeRef.current = timer;
    };

    const resetTimer = () => {
        // Prevent multiple intervals
        if (intervalRef.current) {
            // Clear the interval
            clearInterval(intervalRef.current);
            // Reset the interval reference
            intervalRef.current = null;
        }
        // Reset all states/refs
        setTimer(0);
        savedTimeRef.current = 0;
        startTimeRef.current = 0;
        setIsRecording(false);
        setIsPaused(false);
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
    
    // Function to handle saving the timer duration
    const handleSaveButton = () => {
        // Pause the timer
        pauseTimer();
        // Open the modal with tasks/subtasks list
        setSaveTimerModal(true);
        // Reset the search query state
        setSearchQuery('');
        // Make sure active tab is tasks
        setActiveTab('Tasks');
        // Set filtered list state with the fetched tasks 
        setFilteredList(tasks);
    };

    // Function to alert when user try to save timer when timer is 0
    const handleSaveZero = () => {
        if (timer === 0) {
            // Alert error when user try to save timer when timer is 0
            Alert.alert('Time Error', 'Time should be more than 0!');
            return;
        }
    }

    // Function to save time record and navigate to task or subtask detail screen
    const saveTimeRecordAndNavigate = async (selectedID) => {
        // Validate selectedID is valid
        if (!selectedID) {
            // Alert error when selectedID is not valid
            Alert.alert('Error Selecting Task or Subtask', 'Please select task or subtask first!');
            return;
        }

        try {
            // Store the time daata
            const timeData = {duration: timer};

            if (activeTab === 'Tasks') {
                // If active tab is Tasks take the taskID
                timeData.task_id = selectedID;
            } else {
                // If active tab is Subtasks take the subtaskID
                timeData.subtask_id = selectedID;
            }

            // Create a new time record with the provided details and store it in the database
            await createTimeRecord(db, timeData);

            // Reset the timer
            resetTimer();
            // Close the modal
            setSaveTimerModal(false);

            // Alert success when time is created successfully
            Alert.alert('Success', 'Time created successfully!');

            if (activeTab === 'Tasks') {
                // Navigate to TaskDetailScreen if activeTab is Tasks with parameters taskID and showTimerModal
                navigation.navigate('TaskDetailScreen', {taskID: selectedID, showTimerModal: true});
            } else {
                // Navigate to SubtaskDetailScreen if activeTab is Subtasks with parameters subtaskID and showTimerModal
                navigation.navigate('SubtaskDetailScreen', {subtaskID: selectedID, showTimerModal: true});
            }
        } catch (error) {
            // Log any errors when creating time record
            console.log('Error creating time record:', error);
            // Alert error for time record creation 
            Alert.alert('Error Creating Time Record', 'Failed to create time record.');
        }
    };

    // Function to filter tasks or subtasks based on search query
    const handleSearch = (text) => {
        // Set the search query state with the text written
        setSearchQuery(text);
        // Make the text lower case
        const lowerText = text.toLowerCase();
        if (activeTab === 'Tasks') {
            // If active tab is Tasks filter the tasks based on the task name
            const filtered = tasks.filter(task =>
                task.task_name.toLowerCase().includes(lowerText)
            );
            // Set filtered list state with the filtered tasks 
            setFilteredList(filtered);
        } else {
            // If active tab is Subtasks filter the subtasks based on the subtask name
            const filtered = subtasks.filter(subtask =>
                subtask.subtask_name.toLowerCase().includes(lowerText)
            );
            // Set filtered list state with the filtered subtasks 
            setFilteredList(filtered);
        }
    };

    // Function to switch between Tasks and Subtasks tab
    const switchTab = (newTab) => {
        // Set the active tab according to what was clicked
        setActiveTab(newTab);
        // Reset the search query state
        setSearchQuery('');
        // Reset the search
        handleSearch('');
    };

    // Function to render task/subtask list item
    const renderItem = ({ item }) => {
        const name = activeTab === 'Tasks' ? item.task_name : item.subtask_name;
        return (
            // Render the tasks or subtasks with just their names
            <TouchableOpacity style={styles.itemContainer} onPress={() => saveTimeRecordAndNavigate(item.id)}>
                <Text style={styles.itemText}>{name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Render the header component */}
            <Header />
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{formatTimer(timer)}</Text>                
            </View>
            <View style={styles.buttonContainer}>
                {/* Start Timer button  */}
                {!isRecording && timer === 0 && (
                    <TouchableOpacity onPress={startTimer} style={styles.button}>
                        <Text style={styles.buttonText}>Start</Text>
                    </TouchableOpacity>
                )}
                {/* Pause and Resume switches between each other when clicked  */}
                {isRecording && !isPaused &&(
                    <TouchableOpacity onPress={pauseTimer} style={styles.button}>
                        <Text style={styles.buttonText}>Pause</Text>
                    </TouchableOpacity>
                )}
                {isPaused && timer > 0 && (
                    <TouchableOpacity onPress={startTimer} style={styles.button}>
                        <Text style={styles.buttonText}>Resume</Text>
                    </TouchableOpacity>
                )}
                {/* Reset Timer button  */}
                {isRecording && (
                    <TouchableOpacity onPress={resetTimer} style={styles.button}>
                        <Text style={styles.buttonText}>Reset</Text>
                    </TouchableOpacity>
                )}
            
                {/* Save Time Button */}
                <TouchableOpacity onPress={timer === 0 ? handleSaveZero : handleSaveButton} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>
                        Save Time
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Save Timer Modal */}
            <Modal
                visible={saveTimerModal}
                transparent
                animationType="slide"
                onRequestClose={() => setSaveTimerModal(false)}
                testID='save-timer-modal'
            >
                {/* TouchableWithoutFeedback to allow pressing outside of the overlay to close the modal */}
                <TouchableWithoutFeedback onPress={() => setSaveTimerModal(false)} testID='save-timer-TouchableWithoutFeedback'>
                    <View style={styles.modalOverlay}>
                        {/* TouchableWithoutFeedback to not close the modal when pressing within the overlay */}
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContainer}>
                                {/* Searching query to find tasks */}
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search..."
                                    placeholderTextColor="#A5734D"
                                    value={searchQuery}
                                    onChangeText={handleSearch}
                                />
                                {/* Render the Tasks and Subtasks Tabs */}
                                <View style={styles.tabContainer}>
                                    <TouchableOpacity
                                        style={[styles.tab, activeTab === 'Tasks' && styles.activeTab]}
                                        onPress={() => switchTab('Tasks')}
                                    >
                                        <Text style={[styles.tabText, activeTab === 'Tasks' && styles.activeTabText]}>Tasks</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.tab, activeTab === 'Subtasks' && styles.activeTab]}
                                        onPress={() => switchTab('Subtasks')}
                                    >
                                        <Text style={[styles.tabText, activeTab === 'Subtasks' && styles.activeTabText]}>Subtasks</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* FlatList for tasks or subtasks */}
                                <FlatList
                                    data={filteredList}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderItem}
                                    style={{ maxHeight: 300, marginVertical: 8 }}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyText}>
                                            No {activeTab}!
                                        </Text>
                                    }
                                />

                                
                            </View>
                        </TouchableWithoutFeedback>
                        {/* Button to close the save time modal */}
                        <TouchableOpacity
                            onPress={() => setSaveTimerModal(false)}
                            style={styles.closeButton}
                            testID='save-timer-close'
                        >
                            <Ionicons name="close" size={32} color="#F5F5DC" />
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // Style for the container
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    // Style for the timerContainer
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5DC',
        padding: 12,
    },
    // Style for the buttonContainer
    buttonContainer: {
        backgroundColor: '#F5F5DC',
        justifyContent: 'center',
        marginHorizontal: 6,
        padding: 12,
    },
    // Style for the timerText
    timerText: {
        fontSize: 60,
        fontWeight: '800',
        color: '#8B4513',
    },
    // Style for the button
    button: {
        alignItems: 'center',
        backgroundColor: '#F5F5DC',
        borderColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderRadius: 24,
        marginTop: 12,
    },
    // Style for the buttonText
    buttonText: {
        color: '#8B4513',
        fontSize: 24,
        fontWeight: '500',
    },
    // Style for the saveButton
    saveButton: {
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 2,
        borderColor: '#8B4513',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#8B4513',
    },
    // Style for the saveButtonText
    saveButtonText: {
        color: '#F5F5DC',
        fontSize: 28,
        fontWeight: '800',
    },
    // Style for the modalOverlay
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    // Style for the modalContainer
    modalContainer: {
        backgroundColor: '#F5F5DC',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#8B4513',
        minHeight: '80%',
    },
    // Style for the tabContainer
    tabContainer: {
        flexDirection: 'row',
        marginTop: 1,
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
    // Style for the activeTabText
    activeTabText: {
        color: '#F5F5DC',
        fontSize: 24,
        fontWeight: 'bold',
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
    // Style for the searchInput
    searchInput: {
        borderWidth: 2,
        borderColor: '#8B4513',
        backgroundColor: '#F5F5DC',
        color: '#8B4513',
        borderRadius: 8,
        fontSize: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        fontWeight: '500',
    },
    // Style for the itemContainer
    itemContainer: {
        backgroundColor: '#F5F5DC',
        borderColor: '#8B4513',
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginVertical: 4,
    },
    // Style for the itemText
    itemText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#8B4513',
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
    // Style for the emptyText
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#8B4513',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default TimerScreen;