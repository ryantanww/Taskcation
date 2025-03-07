// Import dependencies and libraries used for testing Add Task Screen
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddTaskScreen from '../screens/AddTaskScreen';
import { createTask, deleteTask } from '../services/taskService';
import { createAttachment } from '../services/attachmentService';
import { getGroupsByCreator } from '../services/groupsService';
import { getAllPriorities } from '../services/priorityLevelsService';
import { getGradeByID } from '../services/gradesService';
import { suggestGradePriority, suggestDatePriority } from '../utils/suggestPriority';
import { Alert } from 'react-native'; 

// Array of mocked groups to do dropdown testing
const mockGroups = [
    { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123', grade_id: 'A' },
    { id: '2', group_name: 'General', group_type: 'Categories', created_by: 'temp_user_123', grade_id: 'NA' },
];

// Array of mocked priorities to do dropdown testing
const mockPriorities = [
    { id: '1', priority_name: 'Urgent' },
    { id: '2', priority_name: 'High' },
    { id: '3', priority_name: 'Medium' },
    { id: '4', priority_name: 'Low' },
    { id: '5', priority_name: 'N/A' },
];

// Mock AddAttachments Component
jest.mock('../components/AddAttachments', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return ({ onAttachmentsChange }) => (
        <TouchableOpacity
            testID='insert-attachment-button'
            onPress={() => {
                const newAttachment = {
                    id: '1',
                    file_name: 'test_attachment.pdf',
                    file_type: 'application/pdf',
                    uri: 'https://test.com/test_attachment.pdf',
                    size: 1024,
                };
                onAttachmentsChange([newAttachment]);
            }}
        >
            <Text>Insert Attachment</Text>
        </TouchableOpacity>
    );
});

// Mock ViewAttachments Component
jest.mock('../components/ViewAttachments', () => {
    const React = require('react');
    const { TouchableOpacity, Text, View } = require('react-native');
    return ({ attachments, onDeleteAttachment }) => (
        <View>
            {attachments.map((attachment) => (
                <View key={attachment.uri}>
                    <Text>{attachment.file_name}</Text>
                    <TouchableOpacity
                        testID={`delete-${attachment.id}`}
                        onPress={() => onDeleteAttachment(attachment)}
                    >
                        <Text>Delete</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
});

// Mock useNavigation hook
const mockNavigation = {
    goBack: jest.fn(),
    addListener: jest.fn(() => {
        return () => {};
    }),
};

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => mockNavigation,
        useIsFocused: jest.fn(() => true),
    };
});

describe('AddTaskScreen', () => {
    // Clear all mocks and reset them before each test
    beforeEach(() => {
        createTask.mockClear();
        createTask.mockReset();
        createAttachment.mockClear();
        createAttachment.mockReset();
        getGroupsByCreator.mockClear();
        getGroupsByCreator.mockReset();
        getAllPriorities.mockClear();
        getAllPriorities.mockReset();
        getGradeByID.mockClear();
        getGradeByID.mockReset();
        suggestGradePriority.mockClear();
        suggestGradePriority.mockReset();
        suggestDatePriority.mockClear();
        suggestDatePriority.mockReset();
        jest.clearAllMocks();
        // Spy on Alert.alert to verify alerts
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        // Spy on console to verify errors
        jest.spyOn(console, 'error').mockImplementation(() => {});
        // Intialise the AsyncStorage with user_id and joined_date
        AsyncStorage.getItem.mockImplementation(async (key) => {
            if (key === 'user_id') {
                return 'temp_user_123';
            }
            return null;
        });
    });

    // Test to check if user ID is stored in AsyncStorage
    it('should store user ID in AsyncStorage', async () => {
        // Retrieve the user ID
        const userId = await AsyncStorage.getItem('user_id');
        // Verify that the user ID is correctly stored
        expect(userId).toBe('temp_user_123');
    });

    // Test to render the Add Task screen with all components
    it('should render the Add Task screen with all components', async () => {
        // Renders the AddTaskScreen component
        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        // Get the current date and time
        const now = new Date();
        const startDateString = now.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = now.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Verify that all components are rendered with the correct text
        expect(getByPlaceholderText('Task Name')).toBeTruthy();
        expect(getByText(startDateString)).toBeTruthy();
        expect(getByText(startTimeString)).toBeTruthy();
        expect(getByText('End Date')).toBeTruthy();
        expect(getByText('End Time')).toBeTruthy();
        expect(getByPlaceholderText('Task Notes.....')).toBeTruthy();
        expect(getByText('Groups')).toBeTruthy();
        expect(getByText('Priority Level')).toBeTruthy();
        expect(getByText('Insert Attachment')).toBeTruthy();
        expect(getByText('Add')).toBeTruthy();
    });

    // Test to select start date and time, end date and time and display the updated values
    it('should select start date and time, end date and time and display the updated values', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'Date Test Task');

        // Get the current date and time
        const now = new Date();
        const nowDateString = now.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const nowTimeString = now.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Start date set to one day ago
        const earlierDate = new Date(new Date().getTime() - 86400000 );
        const startDateString = earlierDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const startTimeString = earlierDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // End date set to one day later and a few minutes later
        const laterDate = new Date(new Date().getTime() + 86400000 + 300000);
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});
        const endTimeString = laterDate.toLocaleTimeString('en-GB',{hour:'2-digit', minute:'2-digit'});

        // Press on start date which is usually todays date
        fireEvent.press(getByText(nowDateString));
        // Retrieve the start date picker component
        const startDatePicker = getByTestId('startDatePicker');
        // Simulate changing the start date to an earlier date
        fireEvent(startDatePicker, 'onChange', {type: 'set'}, earlierDate);

        // Press on start time which is usually current time
        fireEvent.press(getByText(nowTimeString));
        // Retrieve the start time picker component
        const startTimePicker = getByTestId('startTimePicker');
        // Simulate changing the start time to an earlier time
        fireEvent(startTimePicker, 'onChange', {type: 'set'}, earlierDate);

        // Press on end date 
        fireEvent.press(getByText('End Date'));
        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');
        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);

        // Press on end time which generates the time after selecting the date
        fireEvent.press(getByText(endTimeString));
        // Retrieve the end time picker component
        const endTimePicker = getByTestId('endTimePicker');
        // Simulate changing the end time 
        fireEvent(endTimePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that all the date is displayed correctly
            expect(getByText(startDateString)).toBeTruthy();
            expect(getByText(startTimeString)).toBeTruthy();
            expect(getByText(endDateString)).toBeTruthy();
            expect(getByText(endTimeString)).toBeTruthy();
        });
    });

    // Test to successfully create a task and clear the form
    it('should successfully create a task and clear the form', async () => {
        // Mock the successful creation of a task with taskID task1
        createTask.mockResolvedValueOnce('task1');
        // Mock successful attachment creation
        createAttachment.mockResolvedValueOnce(undefined);

        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'A' });
        suggestGradePriority.mockReturnValueOnce('Low');
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on Math
        fireEvent.press(getByText('Math'));
    
        // Press on Priority Level dropdown
        fireEvent.press(getByText('Priority Level'));
        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        // Press on Urgent
        fireEvent.press(getByText('Urgent'));
    
        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify createTask was called once
            expect(createTask).toHaveBeenCalledTimes(1);
            // Verify the task creation information
            expect(createTask).toHaveBeenCalledWith(expect.any(Object), {
                task_name: 'My Task',
                created_by: 'temp_user_123',
                start_date: expect.any(Date),
                end_date: expect.any(Date),
                duration: expect.any(Number),
                task_notes: 'Testing Task Notes.',
                group_id: '1',
                priority_id: '1',
                status: false,
            });

            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify the attachment creation information
            expect(createAttachment).toHaveBeenCalledWith(expect.any(Object), {
                task_id: 'task1',
                created_by: 'temp_user_123',
                file_name: 'test_attachment.pdf',
                file_type: 'application/pdf',
                uri: 'https://test.com/test_attachment.pdf',
                size: 1024,
                durationMillis: null,
            });
            // Verify the priority suggestion alert of Low for grade A
            expect(Alert.alert.mock.calls[0]).toEqual(['I suggest a priority of Low for grade A!']);

            // Verify the success alert for task creation
            expect(Alert.alert.mock.calls[1]).toEqual(['Success', 'Task created successfully!']);
        });
        
        await waitFor(() => {
            // Verify that the form resets after task creation
            expect(getByPlaceholderText('Task Name').props.value).toBe('');
            expect(getByText('End Date')).toBeTruthy();
            expect(getByText('End Time')).toBeTruthy();
            expect(getByPlaceholderText('Task Notes.....').props.value).toBe('');
            expect(queryByText('test_attachment.pdf')).toBeNull();
            // Verify that goBack was called once
            expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });
    });
    
    // Test to delete an attachment
    it('should delete an attachment', async () => {
        // Mock the successful creation of a task with taskID task1
        createTask.mockResolvedValueOnce('task1');
        // Mock successful attachment creation
        createAttachment.mockResolvedValueOnce(undefined);

        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'Delete attachment');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on General
        fireEvent.press(getByText('General'));

        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        // Press the delete button for the first attachment
        fireEvent.press(getByTestId('delete-1')); 
        await waitFor(() => {
            // Ensure that the attachment is deleted and not displayed
            expect(queryByText('test_attachment.pdf')).toBeNull();
        });
    });

    // Test to load groups and priorities on mount
    it('should load groups and priorities on mount', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );

        // Verify Groups and Priority Level is displayed
        expect(getByText('Groups')).toBeTruthy();
        expect(getByText('Priority Level')).toBeTruthy();

        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
    
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
            expect(getGroupsByCreator).toHaveBeenCalledTimes(1);
        });
        fireEvent.press(getByText('General'));

        // Press on Priority Level dropdown
        fireEvent.press(getByText('Priority Level'));

        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
            expect(getAllPriorities).toHaveBeenCalledTimes(1);
        });
    });

    // Test to initialise if the screen is focused
    it('should initialise if the screen is focused', async () => {
        // Mock useIsFocused to be true
        useIsFocused.mockReturnValueOnce(true);
    
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify the getGroupsByCreator and getAllPriorities has been called once
            expect(getGroupsByCreator).toHaveBeenCalledTimes(1);
            expect(getAllPriorities).toHaveBeenCalledTimes(1);
        });
    });
    
    // Test to not initialise when the screen is not focused
    it('should not initialise when the screen is not focused', async () => {
        // Mock useIsFocused to be false
        useIsFocused.mockReturnValueOnce(false);
    
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify the getGroupsByCreator and getAllPriorities has not been called
            expect(getGroupsByCreator).not.toHaveBeenCalled();
            expect(getAllPriorities).not.toHaveBeenCalled();
        });
    });

    // Test to show suggestion alert for group grade A
    it('should show suggestion alert for group grade A', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'A' });
        suggestGradePriority.mockReturnValueOnce('Low');
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with Low for grade A
            expect(Alert.alert).toHaveBeenCalledWith('I suggest a priority of Low for grade A!');
        });
    });

    // Test to show suggestion alert for group grade B
    it('should show suggestion alert for group grade B', async () => {
        // Mock the group with correct grade
        const mockGroup = [
            { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123', grade_id: 'B' },
        ];
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroup);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'B' });
        suggestGradePriority.mockReturnValueOnce('Low');
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with Low for grade B
            expect(Alert.alert).toHaveBeenCalledWith('I suggest a priority of Low for grade B!');
        });
    });

    // Test to show suggestion alert for group grade C
    it('should show suggestion alert for group grade C', async () => {
        // Mock the group with correct grade
        const mockGroup = [
            { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123', grade_id: 'C' },
        ];
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroup);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'C' });
        suggestGradePriority.mockReturnValueOnce('Medium');
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with Medium for grade C
            expect(Alert.alert).toHaveBeenCalledWith('I suggest a priority of Medium for grade C!');
        });
    });

    // Test to show suggestion alert for group grade D
    it('should show suggestion alert for group grade D', async () => {
        // Mock the group with correct grade
        const mockGroup = [
            { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123', grade_id: 'D' },
        ];
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroup);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'D' });
        suggestGradePriority.mockReturnValueOnce('High');
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with High for grade D
            expect(Alert.alert).toHaveBeenCalledWith('I suggest a priority of High for grade D!');
        });
    });

    // Test to show suggestion alert for group grade E
    it('should show suggestion alert for group grade E', async () => {
        // Mock the group with correct grade
        const mockGroup = [
            { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123', grade_id: 'E' },
        ];
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroup);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'E' });
        suggestGradePriority.mockReturnValueOnce('Urgent');
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with Urgent for grade E
            expect(Alert.alert).toHaveBeenCalledWith('I suggest a priority of Urgent for grade E!');
        });
    });

    // Test to show suggestion alert for group grade F
    it('should show suggestion alert for group grade F', async () => {
        // Mock the group with correct grade
        const mockGroup = [
            { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123', grade_id: 'F' },
        ];
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroup);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'F' });
        suggestGradePriority.mockReturnValueOnce('Urgent');
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with Urgent for grade F
            expect(Alert.alert).toHaveBeenCalledWith('I suggest a priority of Urgent for grade F!');
        });
    });

    // Test to not show suggestion alert for group grade N/A
    it('should not show suggestion alert for group grade N/A', async () => {
        // Mock the group with correct grade
        const mockGroup = [
            { id: '1', group_name: 'Math', group_type: 'Subjects', created_by: 'temp_user_123', grade_id: 'NA' },
        ];
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroup);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'NA' });
        suggestGradePriority.mockReturnValueOnce('N/A');
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is not called for grades that are N/A
            expect(Alert.alert).not.toHaveBeenCalledWith();
        });
    });

    // Test to not show suggestion alert for group type as category
    it('should not show suggestion alert for group type as category', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that General is displayed correctly
            expect(getByText('General')).toBeTruthy();
        });

        // Press General
        fireEvent.press(getByText('General'));
    
        await waitFor(() => {
            // Verify the priority suggestion alert is not called for group types as category
            expect(Alert.alert).not.toHaveBeenCalledWith();
        });
    });

    // Test to show suggestion alert for end date less than 1 day
    it('should show suggestion alert for end date less than 1 day', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Urgent');
    
        // Renders the AddTaskScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86000000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with less than 1 day
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Urgent for end date ${endDateString}!`);
        });
    });

    // Test to show suggestion alert for end date when end time is selected
    it('should show suggestion alert for end date when end time is selected', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Urgent');
    
        // Renders the AddTaskScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on end time 
        fireEvent.press(getByText('End Time'));

        // Retrieve the end time picker component
        const endTimePicker = getByTestId('endTimePicker');

        // End time set few seconds later
        const laterTime = new Date(new Date().getTime() + 3000); 
        const endTimeString = laterTime.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end time to an later time
        fireEvent(endTimePicker, 'onChange', {type: 'set'}, laterTime);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with less than 1 day when selecting time
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Urgent for end date ${endTimeString}!`);
        });
    });

    // Test to show suggestion alert for end date more than 1 day and less than 5 days
    it('should show suggestion alert for end date more than 1 day and less than 5 days', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('High');
    
        // Renders the AddTaskScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 172800000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with more than 1 day and less than 5 days
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of High for end date ${endDateString}!`);
        });
    });

    // Test to show suggestion alert for end date more than 5 days and less than 10 days
    it('should show suggestion alert for end date more than 5 days and less than 10 days', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Medium');
    
        // Renders the AddTaskScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 518400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with more than 5 day and less than 10 days
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Medium for end date ${endDateString}!`);
        });
    });

    // Test to show suggestion alert for end date more than 10 days
    it('should show suggestion alert for end date more than 10 days', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce('Low');
    
        // Renders the AddTaskScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 950400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the priority suggestion alert is called correctly with more than 10 days
            expect(Alert.alert).toHaveBeenCalledWith(`I suggest a priority of Low for end date ${endDateString}!`);
        });
    });

    // Test to show an alert if failed to add task
    it('should show an alert if failed to add task', async () => {
        // Mock task creation error
        createTask.mockRejectedValueOnce(new Error('Failed to create task'));
        
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'A' });
        suggestGradePriority.mockReturnValueOnce('Low');
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on Math
        fireEvent.press(getByText('Math'));
    
        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify createTask was called once
            expect(createTask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when task creation or attachment creation failed
            expect(Alert.alert).toHaveBeenCalledWith('Task Creation Error', 'Failed to create the task or attachments.');
        });
        
    });

    // Test to show an alert if failed to add attachments and delete the task
    it('should show an alert if failed to add attachments and delete the task', async () => {
        // Mock the successful creation of a task with taskID task1
        createTask.mockResolvedValueOnce('task1');
        // Mock deleteTask
        deleteTask.mockResolvedValueOnce(undefined);
        // Mock attachment creation error
        createAttachment.mockRejectedValueOnce(new Error('Failed to create attachment'));

        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);

        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'A' });
        suggestGradePriority.mockReturnValueOnce('Low');
    
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Change the task notes
        fireEvent.changeText(getByPlaceholderText('Task Notes.....'), 'Testing Task Notes.');
    
        // Press on Groups dropdown
        fireEvent.press(getByText('Groups'));
        await waitFor(() => {
            // Verify the groups shown matches the mockGroups
            expect(getByText('Math')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
        });
        // Press on Math
        fireEvent.press(getByText('Math'));
    
        // Press on Priority Level dropdown
        fireEvent.press(getByText('Priority Level'));
        await waitFor(() => {
            // Verify the priorities shown matches the mockPriorities
            expect(getByText('Urgent')).toBeTruthy();
            expect(getByText('High')).toBeTruthy();
            expect(getByText('Medium')).toBeTruthy();
            expect(getByText('Low')).toBeTruthy();
            expect(getByText('N/A')).toBeTruthy();
        });
        // Press on Urgent
        fireEvent.press(getByText('Urgent'));
    
        // Press on Insert Attachment
        fireEvent.press(getByText('Insert Attachment'));
        await waitFor(() => {
            // Verify the mocked attachment is correct
            expect(getByText('test_attachment.pdf')).toBeTruthy();
        });

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify createTask was called once
            expect(createTask).toHaveBeenCalledTimes(1);
            // Verify that the createAttachment was called once
            expect(createAttachment).toHaveBeenCalledTimes(1);
            // Verify that deleteTask has been called
            expect(deleteTask).toHaveBeenCalledTimes(1);
            // Verify that an error alert is shown to the user when task creation or attachment creation failed
            expect(Alert.alert).toHaveBeenCalledWith('Task Creation Error', 'Failed to create the task or attachments.');
        });
    });

    // Test to show an alert if Task Name is missing
    it('should show an alert if Task Name is missing', async () => {
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no task name added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please enter the Task Name.');
        });
    });
    
    // Test to show an alert if End Date is invalid
    it('should show an alert if End Date is invalid', async () => {
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when there is no end date and time added
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please select an End Date and Time.');
        });
    });

    // Test to show an alert if End Date is on or before Start Date
    it('should show an alert if End Date is on or before Start Date', async () => {
        // Renders the AddTaskScreen component
        const { getByPlaceholderText, getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
        
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');
        
        // Press on end date 
        fireEvent.press(getByText('End Date'));
        
        
        // Set an invalid end date
        const invalidEndDate = new Date('2025-01-19T10:00:00');
        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');
        // Simulate changing the end date to an earlier date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, invalidEndDate);

        // Press on Add button
        fireEvent.press(getByText('Add'));
        
        await waitFor(() => {
            // Verify that an error alert is shown to the user when end date is earlier than start date
            expect(Alert.alert).toHaveBeenCalledWith('Invalid Date', 'End Date must be on or after the Start Date.');
        });
    });
    
    // Test to show an alert if Group is not selected
    it('should show an alert if Group is not selected', async () => {
        // Renders the AddTaskScreen component
        const { getByText, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Change the task name
        fireEvent.changeText(getByPlaceholderText('Task Name'), 'My Task');

        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to one day later
        const laterDate = new Date(new Date().getTime() + 86400000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify that end date is displayed correctly
            expect(getByText(endDateString)).toBeTruthy();
        });

        // Press on Add button
        fireEvent.press(getByText('Add'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when no group was selected
            expect(Alert.alert).toHaveBeenCalledWith('Incomplete Task', 'Please select a Group.');
        });
    });

    
    // Test to show an alert if loading groups fails
    it('should show an alert if loading groups fails', async () => {
        // Mock loading group error
        getGroupsByCreator.mockRejectedValueOnce(new Error('Groups Initialisation Error'));
        // Mock priority services
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Renders the AddTaskScreen component
        render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when group loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising User, Groups and Priorities Error', 'Failed to initialise user, groups and priorities.');
        });
    });

    // Test to show an alert if loading priority levels fails
    it('should show an alert if loading priority levels fails', async () => {
        // Mock groups services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        // Mock loading priorities error
        getAllPriorities.mockRejectedValueOnce(new Error('Priority Levels Initialisation Error'));
    
        // Renders the AddTaskScreen component
        render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when priorities loading fails
            expect(Alert.alert).toHaveBeenCalledWith('Initialising User, Groups and Priorities Error', 'Failed to initialise user, groups and priorities.');
        });
    });

    // Test to show an alert if failed to fetch grade
    it('should show an alert if failed to fetch grade', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade error
        getGradeByID.mockRejectedValueOnce(new Error('Error Fetching Grade'));
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify that an error alert is shown to the user when fetching grade fails
            expect(Alert.alert).toHaveBeenCalledWith('Error Fetching Grade', 'Failed to fetch grade.');
        });
    });

    // Test to show console error when no suggestion is returned for grades
    it('should show console error when no suggestion is returned for grades', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock grade and priority suggestion
        getGradeByID.mockResolvedValueOnce({ grade: 'A' });
        suggestGradePriority.mockReturnValueOnce(undefined);
    
        // Renders the AddTaskScreen component
        const { getByText } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press Groups
        fireEvent.press(getByText('Groups'));

        await waitFor(() => {
            // Verify that Math is displayed correctly
            expect(getByText('Math')).toBeTruthy();
        });

        // Press Math
        fireEvent.press(getByText('Math'));
    
        await waitFor(() => {
            // Verify the console error logged that there is an error suggesting priority for group
            expect(console.error).toHaveBeenCalledWith('Error Suggesting Priority for Group.');
        });
    });

    // Test to show console error when no suggestion is returned for end date
    it('should show console error when no suggestion is returned for end date', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce(undefined);
    
        // Renders the AddTaskScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on end date 
        fireEvent.press(getByText('End Date'));

        // Retrieve the end date picker component
        const endDatePicker = getByTestId('endDatePicker');

        // End date set to less than one day later
        const laterDate = new Date(new Date().getTime() + 86000000); 
        const endDateString = laterDate.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end date to an later date
        fireEvent(endDatePicker, 'onChange', {type: 'set'}, laterDate);
    
        await waitFor(() => {
            // Verify the console error logged that there is an error suggesting priority for end date
            expect(console.error).toHaveBeenCalledWith('Error Suggesting Priority for End Date.');
        });
    });

    // Test to show console error when no suggestion is returned for end time
    it('should show console error when no suggestion is returned for end time', async () => {
        // Mock group and priority services
        getGroupsByCreator.mockResolvedValueOnce(mockGroups);
        getAllPriorities.mockResolvedValueOnce(mockPriorities);
    
        // Mock priority suggestion
        suggestDatePriority.mockReturnValueOnce(undefined);
    
        // Renders the AddTaskScreen component
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <AddTaskScreen />
            </NavigationContainer>
        );
    
        // Press on end time 
        fireEvent.press(getByText('End Time'));

        // Retrieve the end time picker component
        const endTimePicker = getByTestId('endTimePicker');

        // End time set few seconds later
        const laterTime = new Date(new Date().getTime() + 3000); 
        const endTimeString = laterTime.toLocaleDateString('en-GB', {day: '2-digit', month:'2-digit', year:'numeric'});

        // Simulate changing the end time to an later time
        fireEvent(endTimePicker, 'onChange', {type: 'set'}, laterTime);
    
        await waitFor(() => {
            // Verify the console error logged that there is an error suggesting priority for end time
            expect(console.error).toHaveBeenCalledWith('Error Suggesting Priority for End Time.');
        });
    });

    // Snapshot Test Group
    describe('Snapshot Tests', () => {
        // Fixed date for snapshot consistency
        const fixed_date = new Date('2025-01-01T12:00:00Z'); 
    
        beforeEach(() => {
            // Mock Date using Jest's Fake Timers
            jest.useFakeTimers('modern');
            jest.setSystemTime(fixed_date);
        });
    
        afterEach(() => {
            // Restore real timers after snapshot tests
            jest.useRealTimers();
        });
    
        // Snapshot test for AddTaskScreen
        it('should match the snapshot', () => {
            // Renders the AddTaskScreen component
            const { toJSON } = render(
                <NavigationContainer>
                    <AddTaskScreen />
                </NavigationContainer>
            );
    
            // Verify snapshot matches
            expect(toJSON()).toMatchSnapshot();
        });
    });
});