// Import dependencies and libraries used for testing Timer Screen
import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useIsFocused  } from '@react-navigation/native';
import TimerScreen from '../screens/TimerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTasksByCreator } from '../services/taskService';
import { getSubtasksByCreator } from '../services/subtaskService';
import { createTimeRecord } from '../services/timeTrackingService';


// Mock tasks for the test
const mockTasks = [
    { id: 'task1', task_name: 'Task 1', status: false },
    { id: 'task2', task_name: 'Task 2', status: true },
    { id: 'task3', task_name: 'Task 3', status: false },
    { id: 'task4', task_name: 'Task 4', status: false },
];

// Mock subtasks for the test
const mockSubtasks = [
    { id: 'subtask1', subtask_name: 'Subtask 1', status: true },
    { id: 'subtask2', subtask_name: 'Subtask 2', status: false },
    { id: 'subtask3', subtask_name: 'Subtask 3', status: false },
    { id: 'subtask4', subtask_name: 'Subtask 4', status: false },
];

// Mock useNavigation hook
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
        useIsFocused: jest.fn(() => true),
    };
});


describe('TimerScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        getTasksByCreator.mockClear();
        getTasksByCreator.mockReset();
        getSubtasksByCreator.mockClear();
        getSubtasksByCreator.mockReset();
        createTimeRecord.mockClear();
        createTimeRecord.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // Use fake timers for testing
        jest.useFakeTimers();
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
        // Mock the required services
        getTasksByCreator.mockResolvedValue(mockTasks);
        getSubtasksByCreator.mockResolvedValue(mockSubtasks);
    });

    // Test to check if user ID is stored in AsyncStorage
    it('should store user ID in AsyncStorage', async () => {
        // Retrieve the user ID
        const userID = await AsyncStorage.getItem('user_id');
        // Verify that the user ID is correctly stored
        expect(userID).toBe('temp_user_123');
    });

    // Test to render timer screen with all components
    it('should render timer screen with all components', async () => {
        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });
    });

    // Test to call initialise if the screen is focused
    it('should call initialise if the screen is focused', async () => {
        // Mock useIsFocused to be true
        useIsFocused.mockReturnValueOnce(true);
    
        // Renders the TimerScreen component
        render(<TimerScreen />);
    
        await waitFor(() => {
            // Verify the getTasksByCreator has been called twice
            expect(getTasksByCreator).toHaveBeenCalledTimes(2);
        });
    });
    
    // Test to not call initialise again when the screen is not focused
    it('should not call initialise again when the screen is not focused', async () => {
        // Mock useIsFocused to be false
        useIsFocused.mockReturnValueOnce(false);
    
        // Renders the TimerScreen component
        render(<TimerScreen />);
    
        await waitFor(() => {
            // Verify the getTasksByCreator has not been called
            expect(getTasksByCreator).not.toHaveBeenCalled();
        });
    });

    // Test to start the timer when Start is pressed
    it('should start the timer when Start is pressed', async () => {
        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        // Verify Pause and Reset is displayed correctly 
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
    
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
    });

    // Test to pause the timer when Pause is pressed
    it('should pause the timer when Pause is pressed', async () => {
        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);
        
        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Verify Pause and Reset is displayed correctly 
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();

        // Press Pause
        fireEvent.press(getByText('Pause'));
    
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify Resume and Reset is displayed correctly 
        expect(getByText('Resume')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
    });

    // Test to resume the timer when Resume is pressed
    it('should resume the timer when Resume is pressed', async () => {
        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Verify Pause and Reset is displayed correctly 
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();

        // Press Pause
        fireEvent.press(getByText('Pause'));
    
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify Resume and Reset is displayed correctly 
        expect(getByText('Resume')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();

        // Press Resume
        fireEvent.press(getByText('Resume'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Verify that 00:00:00.20 is displayed correctly
        expect(getByText('00:00:00.20')).toBeTruthy();
        // Verify Pause and Reset is displayed correctly 
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();

    });

    // Test to reset the timer when Reset is pressed
    it('should reset the timer when Reset is pressed', async () => {
        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify Pause and Reset is displayed correctly 
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();

        // Press Reset
        fireEvent.press(getByText('Reset'));
    
        // Verify that all components are rendered with the correct details
        expect(getByText('00:00:00.00')).toBeTruthy();
        expect(getByText('Start')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();
    });

    // Test to open the save timer modal and display tasks when Save Time is pressed with timer more than 0
    it('should open the save timer modal and display tasks when Save Time is pressed with timer more than 0', async () => {
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(getByText('Task 3')).toBeTruthy();
            expect(getByText('Task 4')).toBeTruthy();
        });
    });

    // Test to open the save timer modal and display subtasks when Save Time is pressed with timer more than 0
    it('should open the save timer modal and display subtasks when Save Time is pressed with timer more than 0', async () => {
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(getByText('Task 3')).toBeTruthy();
            expect(getByText('Task 4')).toBeTruthy();
        });

        // Press Subtasks
        fireEvent.press(getByText('Subtasks'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and subtasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(queryByText('Subtask 1')).toBeNull();
            expect(getByText('Subtask 2')).toBeTruthy();
            expect(getByText('Subtask 3')).toBeTruthy();
            expect(getByText('Subtask 4')).toBeTruthy();
        });
    });

    // Test to open the save timer modal and display no tasks when Save Time is pressed with timer more than 0
    it('should open the save timer modal and display no tasks when Save Time is pressed with timer more than 0', async () => {
        // Mock empty tasks
        getTasksByCreator.mockResolvedValue([]);
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            // Verify that No Tasks! is displayed correctly
            expect(getByText('No Tasks!')).toBeTruthy();
        });
    });

    // Test to open the save timer modal and display no subtasks when Save Time is pressed with timer more than 0
    it('should open the save timer modal and display no subtasks when Save Time is pressed with timer more than 0', async () => {
        // Mock empty Subtasks
        getSubtasksByCreator.mockResolvedValue([]);
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(getByText('Task 3')).toBeTruthy();
            expect(getByText('Task 4')).toBeTruthy();
        });

        // Press Subtasks
        fireEvent.press(getByText('Subtasks'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and subtasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            // Verify that No Subtasks! is displayed correctly
            expect(getByText('No Subtasks!')).toBeTruthy();
        });
    });
    

    // Test to filter tasks based on search input
    it('should filter tasks based on search input', async () => {
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, queryByText, getByTestId } = render(<TimerScreen />);
        
        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(getByText('Task 3')).toBeTruthy();
            expect(getByText('Task 4')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            // Verify that when searching, only Task 1 is displayed as it is the only task with 1 in it
            fireEvent.changeText(getByPlaceholderText('Search...'), '1');
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(queryByText('Task 3')).toBeNull();
            expect(queryByText('Task 4')).toBeNull();
        });
    });

    // Test to filter subtasks based on search input
    it('should filter subtasks based on search input', async () => {
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, queryByText, getByTestId } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(getByText('Task 3')).toBeTruthy();
            expect(getByText('Task 4')).toBeTruthy();
        });

        // Press Subtasks
        fireEvent.press(getByText('Subtasks'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and subtasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(queryByText('Subtask 1')).toBeNull();
            expect(getByText('Subtask 2')).toBeTruthy();
            expect(getByText('Subtask 3')).toBeTruthy();
            expect(getByText('Subtask 4')).toBeTruthy();
        });

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and subtasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            // Verify that when searching, only Subtask 2 is displayed as it is the only subtask with 2 in it
            fireEvent.changeText(getByPlaceholderText('Search...'), '2');
            expect(queryByText('Subtask 1')).toBeNull();
            expect(getByText('Subtask 2')).toBeTruthy();
            expect(queryByText('Subtask 3')).toBeNull();
            expect(queryByText('Subtask 4')).toBeNull();
        });
    });

    // Test to successfully create time and navigate to TaskDetailScreen when a task is pressed
    it('should successfully create time and navigate to TaskDetailScreen when a task is pressed', async () => {
        // Mock successful time record creation for task
        createTimeRecord.mockResolvedValueOnce('time1');

        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that Task 1 is displayed
            expect(getByText('Task 1')).toBeTruthy();
        });

        // Press on Task 1
        fireEvent.press(getByText('Task 1'));

        await waitFor(() => {
            // Verify that the createTimeRecord was called once
            expect(createTimeRecord).toHaveBeenCalledTimes(1);
            // Verify the time creation information
            expect(createTimeRecord).toHaveBeenCalledWith(expect.any(Object), {
                task_id: 'task1',
                duration: 100,
            });
            // Verify the success alert for time creation
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Time created successfully!');
            // Verify that navigation to TaskDetailScreen screen has been called with taskID and showTimerModal as its parameter 
            expect(mockNavigate).toHaveBeenCalledWith('TaskDetailScreen', { taskID: 'task1', showTimerModal: true });
        });
    });

    // Test to successfully create time and navigate to SubtaskDetailScreen when a subtask is pressed
    it('should successfully create time and navigate to SubtaskDetailScreen when a subtask is pressed', async () => {
        // Mock successful time record creation for subtask
        createTimeRecord.mockResolvedValueOnce('time2');

        // Renders the TimerScreen component
        const { getByText} = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that Subtasks is displayed
            expect(getByText('Subtasks')).toBeTruthy();
        });

        // Press Subtasks
        fireEvent.press(getByText('Subtasks'));

        await waitFor(() => {
            // Verify that Subtask 2 is displayed
            expect(getByText('Subtask 2')).toBeTruthy();
        });

        // Press on Subtask 2
        fireEvent.press(getByText('Subtask 2'));

        await waitFor(() => {
            // Verify that the createTimeRecord was called once
            expect(createTimeRecord).toHaveBeenCalledTimes(1);
            // Verify the time creation information
            expect(createTimeRecord).toHaveBeenCalledWith(expect.any(Object), {
                subtask_id: 'subtask2',
                duration: 100,
            });
            // Verify the success alert for time creation
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Time created successfully!');
            // Verify that navigation to SubtaskDetailScreen screen has been called with subtaskID and showTimerModal as its parameter 
            expect(mockNavigate).toHaveBeenCalledWith('SubtaskDetailScreen', { subtaskID: 'subtask2', showTimerModal: true });
        });
    });

    // Test to close the save timer modal when the close button is pressed
    it('should close the save timer modal when the close button is pressed', async () => {
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText, queryByTestId } = render(<TimerScreen />);
    
        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
    
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(getByText('Task 3')).toBeTruthy();
            expect(getByText('Task 4')).toBeTruthy();
        });

        // Press the close button for save timer modal
        fireEvent.press(getByTestId('save-timer-close'));

        await waitFor(() => {
            // Verify that the save timer modal is closed
            expect(queryByTestId('save-timer-modal')).toBeNull();
        });
    });

    // Test to close the save timer modal when the overlay is pressed
    it('should close the save timer modal when the overlay is pressed', async () => {
        // Renders the TimerScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText, queryByTestId } = render(<TimerScreen />);
    
        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
    
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal, search, tabs and tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByPlaceholderText('Search...')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            expect(getByText('Task 1')).toBeTruthy();
            expect(queryByText('Task 2')).toBeNull();
            expect(getByText('Task 3')).toBeTruthy();
            expect(getByText('Task 4')).toBeTruthy();
        });

        // Press the save timer modal overlay
        fireEvent.press(getByTestId('save-timer-TouchableWithoutFeedback'));

        await waitFor(() => {
            // Verify that the save timer modal is closed
            expect(queryByTestId('save-timer-modal')).toBeNull();
        });
    });

    // Test to show an alert for failing to fetch tasks
    it('should show an alert if failing to fetch tasks', async () => {
        // Mock tasks service with an error
        getTasksByCreator.mockRejectedValueOnce(new Error('Error fetching tasks'));

        // Renders the TimerScreen component
        render(<TimerScreen />);

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch tasks
            expect(Alert.alert).toHaveBeenCalledWith('Error Fetching Tasks or Subtasks', 'Failed to fetch tasks or subtasks.');
        });
    });

    // Test to show an alert for failing to fetch subtasks
    it('should show an alert if failing to fetch subtasks', async () => {
        // Mock subtasks service with an error
        getSubtasksByCreator.mockRejectedValueOnce(new Error('Error fetching subtasks'));

        // Renders the TimerScreen component
        render(<TimerScreen />);

        await waitFor(() => {
            // Verify that an error alert is shown to the user when failed to fetch subtasks
            expect(Alert.alert).toHaveBeenCalledWith('Error Fetching Tasks or Subtasks', 'Failed to fetch tasks or subtasks.');
        });
    });

    // Test to show an alert if Save Time is pressed with time of 0
    it('should show an alert if Save Time is pressed with time of 0', async () => {
        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user when time recorded is 0
            expect(Alert.alert).toHaveBeenCalledWith('Time Error', 'Time should be more than 0!');
        });
    });

    // Test to show an alert if failed to create time record
    it('should show an alert if failed to create time record', async () => {
        // Mock time record creation as error
        createTimeRecord.mockRejectedValueOnce(new Error('Failed to create time record'));

        // Renders the TimerScreen component
        const { getByText } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));

        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });

        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that Task 1 is displayed
            expect(getByText('Task 1')).toBeTruthy();
        });

        // Press on Task 1
        fireEvent.press(getByText('Task 1'));

        await waitFor(() => {
            // Verify createTimeRecord was called once
            expect(createTimeRecord).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when time record creation failed
            expect(Alert.alert).toHaveBeenCalledWith('Error Creating Time Record', 'Failed to create time record.');
        });
    })

    // Test to show an alert if an invalid taskID is passed
    it('should show an alert if an invalid taskID is passed', async () => {
        // Mock getTasksByCreator but mock task with invalid id
        const invalidTask = { id: '', task_name: 'Invalid Task', status: false };
        getTasksByCreator.mockResolvedValue([invalidTask]);

        // Renders the TimerScreen component
        const { getByText, getByTestId } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));


        await waitFor(() => {
            // Verify that save timer modal and Invalid Task is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByText('Invalid Task')).toBeTruthy();
        });

        // Press Invalid Task
        fireEvent.press(getByText('Invalid Task'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user taskID is invalid
            expect(Alert.alert).toHaveBeenCalledWith('Error Selecting Task or Subtask', 'Please select task or subtask first!');
        });
    });

    // Test to show an alert if an invalid subtaskID is passed
    it('should show an alert if an invalid subtaskID is passed', async () => {
        // Mock getSubtasksByCreator but mock subtask with invalid id
        const invalidSubtask = { id: '', subtask_name: 'Invalid Subtask', status: false };
        getSubtasksByCreator.mockResolvedValue([invalidSubtask]);

        // Renders the TimerScreen component
        const { getByText, getByTestId } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify that all components are rendered with the correct details
            expect(getByText('00:00:00.00')).toBeTruthy();
            expect(getByText('Start')).toBeTruthy();
            expect(getByText('Save Time')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that all components are rendered with the correct details
        expect(getByText('Pause')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));


        await waitFor(() => {
            // Verify that save timer modal and Subtasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
        });

        // Press Subtasks
        fireEvent.press(getByText('Subtasks'));

        await waitFor(() => {
            // Verify that save timer modal and Invalid Subtask is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByText('Invalid Subtask')).toBeTruthy();
        });

        // Press Invalid Subtask
        fireEvent.press(getByText('Invalid Subtask'));

        await waitFor(() => {
            // Verify that an error alert is shown to the user subtaskID is invalid
            expect(Alert.alert).toHaveBeenCalledWith('Error Selecting Task or Subtask', 'Please select task or subtask first!');
        });
    });


    // Snapshot test for TimerScreen when tasks is active tab
    it('should match the snapshot when tasks is active tab', async () => {
        // Renders the TimerScreen component
        const { getByText, getByTestId, toJSON } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify Start is displayed correctly 
            expect(getByText('Start')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that Save Time is displayed correctly
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal and Tasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByText('Tasks')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });

    // Snapshot test for TimerScreen when subtasks is active tab
    it('should match the snapshot when subtasks is active tab', async () => {
        // Renders the TimerScreen component
        const { getByText, getByTestId, toJSON } = render(<TimerScreen />);

        await waitFor(() => {
            // Verify Start is displayed correctly 
            expect(getByText('Start')).toBeTruthy();
        });

        // Press Start
        fireEvent.press(getByText('Start'));
    
        await waitFor(() => {
            // Increase timer by 10 milliseconds
            jest.advanceTimersByTime(100);
        });
        
        // Verify that 00:00:00.10 is displayed correctly
        expect(getByText('00:00:00.10')).toBeTruthy();
        // Verify that Save Time is displayed correctly
        expect(getByText('Save Time')).toBeTruthy();

        // Press Save Time
        fireEvent.press(getByText('Save Time'));

        await waitFor(() => {
            // Verify that save timer modal and Subtasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
        });

        // Press Subtasks
        fireEvent.press(getByText('Subtasks'));

        await waitFor(() => {
            // Verify that save timer modal and Subtasks is displayed correctly
            expect(getByTestId('save-timer-modal')).toBeTruthy();
            expect(getByText('Subtasks')).toBeTruthy();
            // Verify Subtask 2 is displayed correctly 
            expect(getByText('Subtask 2')).toBeTruthy();
        });

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
    
});